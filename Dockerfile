# ==============================================================================
# CyberShield AI - Unified Multi-Stage Production Dockerfile
# Stage 1: Node.js builds the React Frontend
# Stage 2: Python lightweight runtime serves the FastAPI API & Frontend SPA
# ==============================================================================

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Install dependencies first for Docker layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build optimized production bundle
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python Production Runtime ---
FROM python:3.11-slim AS production-runtime
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install minimal OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application source
COPY backend/app/ ./backend/app/

# Copy built frontend assets from Stage 1 into the location expected by FastAPI
COPY --from=frontend-builder /build/dist ./frontend/dist

# Create a dedicated directory for persistent SQLite storage
RUN mkdir -p /app/backend/data

# Expose production ports (8000 for standard/local, 10000 for Render)
EXPOSE 8000 10000

# Health check endpoint dynamically matching $PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT:-8000}/api/health || exit 1

# Launch production server via Uvicorn (supporting dynamic $PORT on Render/Cloud)
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
