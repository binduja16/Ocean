from fastapi import FastAPI
from biodiversity import router as biodiversity_router

app = FastAPI()
app.include_router(biodiversity_router, prefix="/api")
