import numpy as np
import cv2

def apply_crosshatch_shading(img, spacing=4):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    crosshatch = np.ones_like(gray) * 255

    for i in range(0, gray.shape[0], spacing):
        for j in range(0, gray.shape[1], spacing):
            val = gray[i, j]
            if val < 50:
                cv2.line(crosshatch, (j, i), (j + spacing, i + spacing), 0, 1)
                cv2.line(crosshatch, (j + spacing, i), (j, i + spacing), 0, 1)
            elif val < 100:
                cv2.line(crosshatch, (j, i), (j + spacing, i + spacing), 0, 1)
            elif val < 150:
                cv2.line(crosshatch, (j + spacing, i), (j, i + spacing), 0, 1)

    crosshatch_bgr = cv2.cvtColor(crosshatch, cv2.COLOR_GRAY2BGR)
    return cv2.subtract(img, 255 - crosshatch_bgr)

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
