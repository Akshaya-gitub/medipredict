import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine, Base
from app.api.routes import router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital No-Show Appointment Predictor API",
    description="Operational clinical support & machine learning prediction intelligence engine for healthcare administrators",
    version="1.0.0"
)

# Enable CORS for local Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Hospital No-Show Appointment Predictor",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
