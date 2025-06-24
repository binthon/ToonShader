from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import numpy as np
import cv2

from services.utils import resize_image

router = APIRouter()

@router.post("/best-edge/")
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

    ideal_density = 0.10
    best = min(results, key=lambda x: abs(x[1] - ideal_density))

    return {"best_method": best[0], "density": round(best[1], 4)}
