from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
import numpy as np
import cv2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

def resize_image(img, max_dim=800):
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    return img

def generate_halftone(gray_img, block_size=6):
    h, w = gray_img.shape
    halftone = np.ones((h, w), dtype=np.uint8) * 255
    for y in range(0, h, block_size):
        for x in range(0, w, block_size):
            block = gray_img[y:y+block_size, x:x+block_size]
            avg = int(np.mean(block))
            radius = int((1 - avg / 255) * (block_size / 2))
            if radius > 0:
                cv2.circle(halftone,
                           (x + block_size // 2, y + block_size // 2),
                           radius,
                           0, -1)
    return halftone

@app.post("/analyze/")
async def analyze_image(file: UploadFile = File(...), edge_method: str = Form("canny")):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "Nie udało się odczytać obrazu."}, status_code=400)

    img = resize_image(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if edge_method == "sobel":
        sobelx = cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_8U, 0, 1, ksize=3)
        edges = cv2.bitwise_or(sobelx, sobely)
    elif edge_method == "laplacian":
        edges = cv2.Laplacian(gray, cv2.CV_8U)
    elif edge_method == "adaptive":
        edges = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    elif edge_method == "dog":
        blur1 = cv2.GaussianBlur(gray, (5, 5), 1)
        blur2 = cv2.GaussianBlur(gray, (5, 5), 2)
        edges = cv2.absdiff(blur1, blur2)
        _, edges = cv2.threshold(edges, 15, 255, cv2.THRESH_BINARY)
    elif edge_method == "gaussian":
        edges = cv2.GaussianBlur(gray, (5, 5), 1)
        _, edges = cv2.threshold(edges, 127, 255, cv2.THRESH_BINARY)
    else:
        edges = cv2.Canny(gray, 50, 150)

    edge_count = int(np.sum(edges > 0))
    height, width = edges.shape
    density = edge_count / (height * width)
    k = int(np.interp(density, [0.01, 0.2], [2, 30]))
    return {"suggested_k": k, "density": density}

@app.post("/process/")
async def process_image(
    file: UploadFile = File(...),
    k: int = Form(5),
    brightness: float = Form(1.0),
    stroke_enabled: int = Form(1),
    use_halftone: int = Form(0),  # nowy
    edge_method: str = Form("canny"),
    
):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "Nie udało się odczytać obrazu."}, status_code=400)

    if k < 2 or k > 30:
        return JSONResponse(content={"error": "Nieprawidłowa wartość k. Dozwolone: 2–30."}, status_code=400)

    img = resize_image(img)
    color = cv2.bilateralFilter(img, 9, 75, 75)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # wybór algorytmu
    if edge_method == "sobel":
        sobelx = cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_8U, 0, 1, ksize=3)
        edges = cv2.bitwise_or(sobelx, sobely)
    elif edge_method == "laplacian":
        edges = cv2.Laplacian(gray, cv2.CV_8U)
    elif edge_method == "adaptive":
        edges = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY_INV,
            11, 2
        )
    elif edge_method == "dog":
        blur1 = cv2.GaussianBlur(gray, (5, 5), 1)
        blur2 = cv2.GaussianBlur(gray, (5, 5), 2)
        edges = cv2.absdiff(blur1, blur2)
        _, edges = cv2.threshold(edges, 15, 255, cv2.THRESH_BINARY)
    elif edge_method == "gaussian":
        blurred = cv2.GaussianBlur(gray, (5, 5), 1)
        _, edges = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
    else:  # domyślnie Canny
        edges = cv2.Canny(gray, 50, 150)

    edges_inv = cv2.bitwise_not(edges)
    edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2BGR)

    data = np.float32(color).reshape((-1, 3))
    _, labels, centers = cv2.kmeans(
        data, k, None,
        (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2),
        10, cv2.KMEANS_RANDOM_CENTERS
    )
    quant = centers[labels.flatten()].reshape(img.shape).astype(np.uint8)

    hsv = cv2.cvtColor(quant, cv2.COLOR_BGR2HSV)
    poster_strength = max(1, int(1.0 / brightness * 5))
    hsv[..., 2] = (hsv[..., 2] // poster_strength) * poster_strength
    quant = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    if use_halftone:
        # Używamy wartości jasności (z HSV)
        hsv = cv2.cvtColor(quant, cv2.COLOR_BGR2HSV)
        v = hsv[..., 2]
        
        # Maskujemy tylko ciemne obszary (np. V < 60)
        shadow_mask = cv2.inRange(v, 0, 60)
        shadow_mask_3ch = cv2.cvtColor(shadow_mask, cv2.COLOR_GRAY2BGR)
        
        # Generujemy halftone (czarne kropki na białym tle)
        gray_ht = cv2.cvtColor(quant, cv2.COLOR_BGR2GRAY)
        halftone = generate_halftone(gray_ht, block_size=6)
        halftone = cv2.cvtColor(halftone, cv2.COLOR_GRAY2BGR)

        # Odwróć halftone: białe tło, czarne kropki → czarne tło, białe kropki
        halftone_inv = 255 - halftone

        # Nałóż halftone tylko tam, gdzie cień
        masked_halftone = cv2.bitwise_and(halftone_inv, shadow_mask_3ch)
        quant = cv2.subtract(quant, masked_halftone)

    toon = cv2.bitwise_and(quant, edges_rgb) if stroke_enabled else quant
    _, img_encoded = cv2.imencode('.png', toon)
    return Response(content=img_encoded.tobytes(), media_type="image/png")

@app.post("/preview/")
async def preview_image(file: UploadFile = File(...), edge_method: str = Form(...)):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if img is None:
        return JSONResponse(content={"error": "Invalid image"}, status_code=400)

    img = resize_image(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if edge_method == "sobel":
        sobelx = cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_8U, 0, 1, ksize=3)
        edges = cv2.bitwise_or(sobelx, sobely)
    elif edge_method == "laplacian":
        edges = cv2.Laplacian(gray, cv2.CV_8U)
    elif edge_method == "adaptive":
        edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    elif edge_method == "dog":
        blur1 = cv2.GaussianBlur(gray, (5, 5), 1)
        blur2 = cv2.GaussianBlur(gray, (5, 5), 2)
        edges = cv2.absdiff(blur1, blur2)
        edges = cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX)
        edges = np.uint8(edges)
    elif edge_method == "gaussian":
        edges = cv2.GaussianBlur(gray, (5, 5), 1)
        _, edges = cv2.threshold(edges, 127, 255, cv2.THRESH_BINARY)
    else:
        edges = cv2.Canny(gray, 100, 200)

    edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    _, img_encoded = cv2.imencode('.png', edges_rgb)
    return Response(content=img_encoded.tobytes(), media_type="image/png")

@app.post("/best-edge/")
async def best_edge_method(file: UploadFile = File(...)):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "Nie udało się odczytać obrazu."}, status_code=400)

    img = resize_image(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    methods = {
        "canny": lambda: cv2.Canny(gray, 50, 150),
        "sobel": lambda: cv2.bitwise_or(
            cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3),
            cv2.Sobel(gray, cv2.CV_8U, 0, 1, ksize=3)
        ),
        "laplacian": lambda: cv2.Laplacian(gray, cv2.CV_8U),
        "adaptive": lambda: cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2),
        "dog": lambda: cv2.threshold(
            cv2.absdiff(cv2.GaussianBlur(gray, (5, 5), 1), cv2.GaussianBlur(gray, (5, 5), 2)),
            15, 255, cv2.THRESH_BINARY)[1],
        "gaussian": lambda: cv2.threshold(
            cv2.GaussianBlur(gray, (5, 5), 1), 127, 255, cv2.THRESH_BINARY)[1]
    }

    results = []
    for method, func in methods.items():
        edges = func()
        density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        results.append((method, density))

    # wybierz metodę o „średniej” gęstości, czyli zbliżoną do idealnej np. 0.05–0.15
    ideal_density = 0.10
    best = min(results, key=lambda x: abs(x[1] - ideal_density))

    return {"best_method": best[0], "density": round(best[1], 4)}
