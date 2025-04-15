import cv2
import numpy as np

def cartoonize_image(img_path, k=15):
    # Wczytaj i przeskaluj obraz
    img = cv2.imread(img_path)
    img = cv2.resize(img, (800, 800))

    # 1. Wygładzanie przy zachowaniu krawędzi
    color = cv2.bilateralFilter(img, d=5, sigmaColor=50, sigmaSpace=50)

    # 2. Wykrycie krawędzi (delikatne)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 120)
    edges_inv = cv2.bitwise_not(edges)
    edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2BGR)

    # 3. Redukcja kolorów (posterization)
    data = np.float32(color).reshape((-1, 3))
    _, labels, centers = cv2.kmeans(
        data, k, None,
        (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2),
        10, cv2.KMEANS_RANDOM_CENTERS
    )
    quant = centers[labels.flatten()].reshape(img.shape).astype(np.uint8)

    # 4. Połączenie uproszczonego obrazu z konturami
    cartoon = cv2.bitwise_and(quant, edges_rgb)

    return cartoon

# Przykład użycia
result = cartoonize_image("test.jpg")
cv2.imwrite("toon_result.png", result)
