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

@app.post("/analyze/")
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    
    if img is None:
        return JSONResponse(content={"error": "Nie udało się odczytać obrazu."}, status_code=400)

    img = resize_image(img)

    unique_colors = len(np.unique(img.reshape(-1, img.shape[2]), axis=0))
    suggested_k = min(30, max(3, unique_colors // 32))
    return {"suggested_k": suggested_k}

@app.post("/process/")
async def process_image(file: UploadFile = File(...), k: int = Form(5)):
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

    toon = cv2.bitwise_and(quant, edges_rgb)

    _, img_encoded = cv2.imencode('.png', toon)
    return Response(content=img_encoded.tobytes(), media_type="image/png")
