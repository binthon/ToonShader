# ToonShader
Aplikacja webowa umożliwiająca przekształcanie obrazów i filmów w stylizowane wersje z efektami kreskowania, halftone i cieniowania. Interfejs użytkownika oparty jest na React, a backend w Pythonie z użyciem FastAPI.
## Strukura projektu
```csharp
project-root/
├── backend/
│   ├── main.py               # Główny plik FastAPI
│   
├── frontend/
│   ├── public/
│   │   └── clicks.jpg        # Logo aplikacji
│   ├── src/
│   │   ├── components/       # Komponenty Reacta
│   │   ├── hooks/            # Hooki
│   │   ├── utils/            # Narzędzia
│   │   └── App.jsx           # Główna aplikacja
│   ├── package.json
│   └── ...
└── README.md
└── requirements.txt      # Zależności Pythona
└── .gitignore
```
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
