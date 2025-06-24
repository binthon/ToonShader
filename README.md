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
