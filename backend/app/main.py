from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import scan, history, guidance

# Initialize database schema on module load
init_db()

app = FastAPI(
    title="CyberShield AI API",
    description="Intelligent Cybersecurity and Fraud Detection System - Detect • Explain • Protect",
    version="1.0.0"
)

# CORS configuration allowing local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(scan.router)
app.include_router(history.router)
app.include_router(guidance.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CyberShield AI",
        "version": "1.0.0",
        "tagline": "Detect • Explain • Protect"
    }

# Mount React production build if available for unified deployment
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["docs", "openapi.json", "redoc"]:
            return None
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend build not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
