# ToonShader
Aplikacja webowa umożliwiająca przekształcanie obrazów i filmów w stylizowane wersje z efektami kreskowania, halftone i cieniowania. Interfejs użytkownika oparty jest na React, a backend w Pythonie z użyciem FastAPI.
## Strukura projektu
```csharp
ToonShader/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── image.py # obsługa przetwaarzania obrazów 
│   │   └── video.py # obsługa przetwarzania filmów
|   |   └── tools.py
│   ├── services/
│   │   ├── edge.py # wykrywanie krawędzi
│   │   └── filters.py # implementacja efektów: halftone, crosshatch, kreskowanie
|   |   └── utils.py
│   
│
├── frontend/
│   ├── public/
│   │   └── clicks.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx # ładowanie plików
│   │   │   ├── PreviewSelector.jsx # komponent do wyboru algorytmu krawędzi na podstawie podglądów
│   │   │   ├── SlidersPanel.jsx # suwaki, checkoboxy
│   │   │   └── ProcessedOutput.jsx # komponent do wyświetlania obrazu, filmu
│   │   ├── hooks/
│   │   │   └── useProcessing.jsx # hook do zarządzania stanem i komunikacją z backendem
│   │   ├── utils/
│   │   │   └── edgeMethods.js # Lista dostępnych algorytmów krawędziowania
│   │   └── App.jsx # główna aplikacja Reacta
│   ├── package.json # zależności i skrypty frontendowe
│   └── tailwind.config.js
│
└── README.md
└── requirements.txt
└── .gitignore
```
## Opis funkcjonalności
Obsługa przetwarzania obrazów i filmów

1. Automatyczne wykrywanie najlepszego algorytmu krawędziowania
2. Dynamiczne suwaki: współczynnik K, jasność
3. Efekty dodatkowe:
  - Efekt kreskowania
  - Halftone 
  - Crosshatch shading
4. Podgląd wyników przetwarzania w czasie rzeczywistym
5. Podgląd wielu algorytmów na podstawie obrazu 
6. Przycisk do generowania filmu – manualnie, po wybraniu ustawień

UWAGA !!!
Przetwarzanie filmów trwa długo dlatego przeyłamy link do testowych filmów z nałozonymi shaderami: [LINK](https://drive.google.com/drive/folders/16re2vkY_t5D77moUd4ywdALqecKE4Xz9?usp=sharing)

### Opis użytych algorytmów krawędziowania
CANNY
Opis: Najbardziej znanyalgorytmów detekcji krawędzi.

Działanie:
- Wygładzenie obrazu (filtr Gaussa),
- Obliczenie gradientu intensywności pikseli,
- Non-maximum suppression (usuwanie niepotrzebnych krawędzi),
- Histereza progowa (łączenie krawędzi na podstawie progów).

SOBEL: Prosty operator gradientowy oparty na macierzach konwolucyjnych.

Działanie:
- Oblicza przybliżony gradient intensywności w kierunkach poziomym i pionowym.
- Mniej precyzyjny niż Canny, może wykrywać grubsze krawędzie.
- 
Laplacian: Operator drugiej pochodnej, wykrywający obszary o szybkiej zmianie intensywności.

Działanie:
- Oblicza drugą pochodną intensywności (Laplacjan), podkreślając przejścia.
- Bardzo czuły na szum – wymaga wcześniejszego wygładzenia.

Adaptive Threshold: Technika progowania adaptacyjnego, która dzieli obraz na czarne i białe regiony w zależności od lokalnego sąsiedztwa.

Działanie:
- Dzieli obraz na regiony i wylicza lokalne progi dla każdego.
- Nadaje bardzo komiksowy, binarny wygląd.
- Stylizowany efekt przypominający tuszowanie w komiksach.

Difference of Gaussians: Technika przybliżająca Laplace of Gaussian, polegająca na odjęciu dwóch rozmytych wersji obrazu.

Działanie:
- Gauss(x, σ₁) − Gauss(x, σ₂), gdzie σ₂ > σ₁
- Kontury przypominające styl mangi/anime, cienkie i stylowe.

Gaussian: To nie jest typowe wykrywanie krawędzi, ale filtr wygładzający.

Działanie:
- Rozmycie Gaussowskie stosowane wstępnie do redukcji szumu.
- Odpowiedni do efektów soft-shading.

## Opis działania programu
 1. Przesyłanie pliku (obraz lub wideo) – Frontend <br>
Użytkownik przeciąga lub wybiera plik (obraz .jpg / .png lub wideo .mp4) za pomocą komponentu FileUploader. <br>
Plik ten jest przechowywany lokalnie (w stanie file) i tworzony jest jego URL.createObjectURL() do podglądu. <br>

2. Analiza pliku i generowanie podglądów – Backend + Frontend <br>
Dla obrazu: 
Frontend (React): 
- Wysyła obraz do endpointu /analyze/ – backend analizuje obraz i zwraca sugerowaną wartość k (używaną np. w segmentacji). 
- Równolegle wysyła wiele żądań /preview/ z tym obrazem i różnymi edge_method, aby wygenerować podglądy metod konturowania. 

Backend (FastAPI): <br>
- /analyze/: analizuje zagęszczenie konturów i sugeruje k. 
- /preview/: dla każdej metody (canny, sobel, itd.) przetwarza obraz i zwraca mały podgląd w stylu wybranej metody. 

Dla wideo: <br>
Frontend wyciąga pierwszą klatkę z wideo w przeglądarce (za pomocą canvas) i traktuje ją jak obraz. <br>
Ta klatka jest następnie wysyłana do backendu, jakby była obrazem, by wygenerować podglądy i analizę k. <br>

3. Użytkownik wybiera ustawienia – Frontend <br>
Z poziomu UI użytkownik ustawia: <br>
- metodę konturów (edgeMethod) 
- suwak k 
- jasność (brightness) 
- efekty dodatkowe (checkboxy): stroke, halftone, crosshatch 

Zmiana wartości uruchamia setShouldProcess(true), co powoduje przetwarzanie (dla obrazów). 

4. Przetwarzanie obrazu – Backend <br>
Endpoint /process/: <br>
- Odbiera przesłany obraz i wszystkie parametry (k, brightness, stroke, itp.)
- Przetwarza obraz za pomocą OpenCV i PIL (krok po kroku: kontury, posterizacja, efekty, nakładki)
- Zwraca gotowy wynik w formie obrazu (image/jpeg)

5. Przetwarzanie wideo – Backend <br>
Po kliknięciu "Generuj wideo", frontend wysyła całe wideo do /process-video/. <br>
Backend: <br>
- Przetwarza każdą klatkę jak obraz (jak w /process/)
- Składa je z powrotem w film (imageio-ffmpeg)
- Zwraca gotowy video/mp4 jako wynik

6. Wynik – Frontend <br>
Otrzymany Blob (obraz lub film) jest zamieniany na URL.createObjectURL. <br>
Wyświetlany w komponencie ProcessedOutput obok oryginału. <br>
Jeśli trwa przetwarzanie – pokazuje się spinner i informacja o czasie oczekiwania.<br>

## Uruchomienie
  ### backend 
```
cd backend
```
Tu za pierwszym razem należy utworzyć wirtualne środowisko
```
python -m venv venv
```
Następnie można używac środowiska
```
source venv/bin/active #Linux
.\venv\Scripts\Activate.ps1 #Windows
```
Instalacja bibliotek
```
pip install -r requirements.txt
```
Uruchmienie backendu
```
uvicorn main:app --reload  
```

  ### frontend

Wymagane jest posiadanie Node.js 18+ oraz npm.
Można pobrać te narzędzia z https://nodejs.org/en

Następnie można przetestować wersje
```
node -v
npm -v
```
Katalog z frontendem
```
cd frontend
```
Instalcja zależności
```
npm install
```
Uruchomienie frontendu
```
npm run dev
```
## Elementu programu do zrobienia lub poprawy
1. Wdrożenie aplikacji do kontenerów dockerowych
2. Poprawa szybkości przetwarzania filmów
3. Poprawa działania ustawiania współczynników
4. Wizualne poprawy
