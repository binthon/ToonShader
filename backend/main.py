from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import image, video, tools

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(image.router)
app.include_router(video.router)
app.include_router(tools.router)

@app.get("/")
def root():
    return {"message": "Grafika API działa poprawnie."}
