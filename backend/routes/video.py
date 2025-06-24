from fastapi import APIRouter, UploadFile, File, Form, Response
from fastapi.responses import JSONResponse
import os, uuid, tempfile, subprocess
import cv2
import numpy as np
import imageio_ffmpeg

from services.edge import detect_edges
from services.filters import generate_halftone, apply_crosshatch_shading

router = APIRouter()

@router.post("/process-video/")
async def process_video(
    file: UploadFile = File(...),
    k: int = Form(5),
    brightness: float = Form(1.0),
    stroke_enabled: int = Form(1),
    use_halftone: int = Form(1),
    use_crosshatch: int = Form(0),
    edge_method: str = Form("canny")
):
    temp_dir = tempfile.gettempdir()
    temp_input_path = os.path.join(temp_dir, f"{uuid.uuid4()}.mp4")
    temp_output_raw = os.path.join(temp_dir, f"{uuid.uuid4()}_raw.mp4")
    temp_output_final = os.path.join(temp_dir, f"{uuid.uuid4()}_final.mp4")

    with open(temp_input_path, "wb") as f:
        f.write(await file.read())

    cap = cv2.VideoCapture(temp_input_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(temp_output_raw, fourcc, fps, (w, h))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = detect_edges(gray, edge_method)
        edges_inv = cv2.bitwise_not(edges)
        edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2BGR)

        color = cv2.bilateralFilter(frame, 9, 75, 75)
        data = np.float32(color).reshape((-1, 3))
        _, labels, centers = cv2.kmeans(
            data, k, None,
            (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2),
            10, cv2.KMEANS_RANDOM_CENTERS
        )
        quant = centers[labels.flatten()].reshape(frame.shape).astype(np.uint8)

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
            final = cv2.bitwise_and(quant, edges_rgb)
        elif use_crosshatch:
            final = apply_crosshatch_shading(quant)
        else:
            final = quant

        out.write(final)

    cap.release()
    out.release()

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", temp_output_raw,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        temp_output_final
    ]

    subprocess.run(cmd, check=True)

    with open(temp_output_final, "rb") as f:
        video_bytes = f.read()

    os.remove(temp_input_path)
    os.remove(temp_output_raw)
    os.remove(temp_output_final)

    return Response(content=video_bytes, media_type="video/mp4")

@router.post("/preview/")
async def preview(
    file: UploadFile = File(...),
    edge_method: str = Form("canny")
):
    ext = file.filename.split(".")[-1]
    temp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.{ext}")
    contents = await file.read()

    with open(temp_path, "wb") as f:
        f.write(contents)

    # Obsługa wideo
    if file.content_type.startswith("video/"):
        cap = cv2.VideoCapture(temp_path)
        success, frame = cap.read()
        cap.release()
        os.remove(temp_path)

        if not success:
            return JSONResponse(content={"error": "Nie udało się odczytać pierwszej klatki"}, status_code=400)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = detect_edges(gray, edge_method)
        edges_inv = cv2.bitwise_not(edges)
        edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2BGR)
        result = cv2.bitwise_and(frame, edges_rgb)
    else:
        # Obsługa obrazka
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        os.remove(temp_path)

        if img is None:
            return JSONResponse(content={"error": "Nie udało się wczytać obrazu"}, status_code=400)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = detect_edges(gray, edge_method)
        edges_inv = cv2.bitwise_not(edges)
        edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2BGR)
        result = cv2.bitwise_and(img, edges_rgb)

    # Kodowanie do PNG
    _, buffer = cv2.imencode(".png", result)
    return Response(content=buffer.tobytes(), media_type="image/png")