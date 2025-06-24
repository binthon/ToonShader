import cv2
import numpy as np

def detect_edges(gray, method: str):
    if method == "sobel":
        sobelx = cv2.Sobel(gray, cv2.CV_8U, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_8U, 0, 1, ksize=3)
        return cv2.bitwise_or(sobelx, sobely)
    elif method == "laplacian":
        return cv2.Laplacian(gray, cv2.CV_8U)
    elif method == "adaptive":
        return cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    elif method == "dog":
        blur1 = cv2.GaussianBlur(gray, (5, 5), 1)
        blur2 = cv2.GaussianBlur(gray, (5, 5), 2)
        diff = cv2.absdiff(blur1, blur2)
        _, thresh = cv2.threshold(diff, 15, 255, cv2.THRESH_BINARY)
        return thresh
    elif method == "gaussian":
        blurred = cv2.GaussianBlur(gray, (5, 5), 1)
        _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
        return thresh
    else:
        return cv2.Canny(gray, 50, 150)
