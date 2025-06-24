from fastapi import APIRouter, UploadFile, File, Form, Response
from fastapi.responses import JSONResponse
import numpy as np
import cv2

from services.utils import resize_image
from services.filters import apply_crosshatch_shading, generate_halftone
from services.edge import detect_edges

router = APIRouter()

@router.post("/analyze/")
async def analyze_image(file: UploadFile = File(...), edge_method: str = Form("canny")):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "Nie udało się odczytać obrazu."}, status_code=400)

    img = resize_image(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = detect_edges(gray, edge_method)

    edge_count = int(np.sum(edges > 0))
    height, width = edges.shape
    density = edge_count / (height * width)
    k = int(np.interp(density, [0.01, 0.2], [2, 30]))
    return {"suggested_k": k, "density": density}


@router.post("/process/")
async def process_image(
    file: UploadFile = File(...),
    k: int = Form(5),
    brightness: float = Form(1.0),
    stroke_enabled: int = Form(1),
    use_halftone: int = Form(0),
    use_crosshatch: int = Form(0),
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
    edges = detect_edges(gray, edge_method)

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
        v = hsv[..., 2]
        shadow_mask = cv2.inRange(v, 0, 60)
        shadow_mask_3ch = cv2.cvtColor(shadow_mask, cv2.COLOR_GRAY2BGR)
        gray_ht = cv2.cvtColor(quant, cv2.COLOR_BGR2GRAY)
        halftone = generate_halftone(gray_ht, block_size=6)
        halftone = cv2.cvtColor(halftone, cv2.COLOR_GRAY2BGR)
        halftone_inv = 255 - halftone
        masked_halftone = cv2.bitwise_and(halftone_inv, shadow_mask_3ch)
        quant = cv2.subtract(quant, masked_halftone)

    if stroke_enabled:
        toon = cv2.bitwise_and(quant, edges_rgb)
    elif use_crosshatch:
        toon = apply_crosshatch_shading(quant)
    else:
        toon = quant

    _, img_encoded = cv2.imencode('.png', toon)
    return Response(content=img_encoded.tobytes(), media_type="image/png")


@router.post("/preview/")
async def preview_image(file: UploadFile = File(...), edge_method: str = Form(...)):
    content = await file.read()
    img_np = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "Invalid image"}, status_code=400)

    img = resize_image(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = detect_edges(gray, edge_method)

    edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    _, img_encoded = cv2.imencode('.png', edges_rgb)
    return Response(content=img_encoded.tobytes(), media_type="image/png")
