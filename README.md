# ToonShader
Aplikacja webowa umożliwiająca przekształcanie obrazów i filmów w stylizowane wersje z efektami kreskowania, halftone i cieniowania. Interfejs użytkownika oparty jest na React, a backend w Pythonie z użyciem FastAPI.
## Strukura projektu
ToonShader/
│
├── backend/
│   ├── main.py               # Główny plik FastAPI
│   ├── requirements.txt      # Zależności Pythona
│   └── ...                   # Pliki do analizy i przetwarzania
│
├── frontend/
│   ├── public/
│   │   └── clicks.jpg        # Logo aplikacji
│   ├── src/
│   │   ├── components/       # Komponenty Reacta 
│   │   ├── hooks/            # Własne hooki (
│   │   ├── utils/            # Dodatkowe funkcje
│   │   └── App.jsx           # Główna aplikacja React
│   ├── package.json          # Konfiguracja npm i zależności
│   └── tailwind.config.js
│
└── README.md
└── gitignore
└── requirements.txt

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
