# CyberShield AI - Complete Production Deployment Guide

This guide covers all deployment strategies for **CyberShield AI**, from containerized single-command deployments to cloud PaaS and Linux VPS production setups.

---

## 📑 Deployment Methods Overview

| Method | Best For | Complexity | Cost |
| :--- | :--- | :--- | :--- |
| **Option 1: Docker (Unified)** | Any Cloud VPS / Local Server | Low | Free / Server cost |
| **Option 2: Render.com / Railway** | Student & College Presentations | Very Low | Free tier available |
| **Option 3: Split (Vercel + Render)** | High-traffic Frontend Scaling | Low | Free tier available |
| **Option 4: Ubuntu Linux VPS** | Custom Enterprise / Academic Servers | Medium | VPS cost ($4–$10/mo) |

---

## 🐳 Option 1: Unified Containerized Deployment (Recommended)

CyberShield AI includes a **Multi-Stage Dockerfile** that builds the React application and serves both the frontend and FastAPI backend from a single lightweight container.

### Step 1: Build & Launch with Docker Compose
```bash
# Clone or navigate to the project directory
cd d:/cybershelid

# Build and start in detached mode
docker compose up -d --build
```

### Step 2: Verify Deployment
- Open browser: `http://localhost:8000`
- API Health: `http://localhost:8000/api/health`
- Interactive API Docs: `http://localhost:8000/docs`

### Step 3: Manage Container
```bash
# Check container status
docker compose ps

# View live application logs
docker compose logs -f

# Stop container
docker compose down
```

> **SQLite Persistence**: Docker Compose mounts a named volume `cybershield_db` to `/app/backend`. Your scan history is safely preserved across container restarts and rebuilds.

---

## ☁️ Option 2: Render.com (Zero-Config Cloud Hosting)

Render provides free web service hosting with native Docker support.

### Step-by-Step Instructions:
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your `cybershield` repository.
5. Choose **Docker** as the Environment.
6. Configure Settings:
   - **Name**: `cybershield-ai`
   - **Region**: Nearest to you (e.g., Oregon or Frankfurt)
   - **Branch**: `main`
   - **Health Check Path**: `/api/health`
7. Click **Create Web Service**.
8. Render will automatically build the React assets, install Python packages, and assign an HTTPS URL (e.g., `https://cybershield-ai.onrender.com`).

*(Optional: Use the included [`render.yaml`](./render.yaml) blueprint for 1-click infrastructure deployment).*

---

## ⚡ Option 3: Split Cloud Deployment (Vercel + Render / Railway)

If you prefer hosting the React frontend on Vercel's global CDN and the FastAPI backend on Render or Railway:

### 1. Deploy Backend (FastAPI) on Render / Railway
- Deploy only the `backend/` directory as a Python web service.
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Copy the resulting backend URL (e.g., `https://cybershield-api.onrender.com`).

### 2. Deploy Frontend on Vercel
- Import repository into [Vercel](https://vercel.com/).
- Set **Root Directory** to `frontend`.
- In `deployment/vercel.json`, update the rewrite target:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/:path*",
        "destination": "https://cybershield-api.onrender.com/api/:path*"
      },
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- Deploy. Vercel will route all `/api/*` calls directly to your FastAPI backend with zero CORS issues!

---

## 🖥️ Option 4: Linux VPS Deployment (Ubuntu 22.04 / 24.04)

For hosting on an Ubuntu VPS (DigitalOcean, AWS EC2, Linode, Hetzner) with Nginx and SSL.

### 1. Server Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx
```

### 2. Setup Application Code
```bash
sudo mkdir -p /var/www/cybershield
sudo chown -R $USER:$USER /var/www/cybershield
cd /var/www/cybershield

# Copy or git clone files here
git clone <your-repo-url> .

# Build React Frontend
cd frontend
npm ci
npm run build
cd ..

# Setup Python Virtual Environment
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install gunicorn
```

### 3. Configure Systemd Service
Copy the provided unit file:
```bash
sudo cp deployment/cybershield.service /etc/systemd/system/cybershield.service
sudo systemctl daemon-reload
sudo systemctl enable cybershield
sudo systemctl start cybershield
sudo systemctl status cybershield
```

### 4. Configure Nginx Reverse Proxy
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/cybershield
sudo ln -s /etc/nginx/sites-available/cybershield /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Obtain Free Let's Encrypt SSL Certificate
```bash
sudo certbot --nginx -d cybershield.yourdomain.com
```

---

## 🛡️ Production Security Checklist

- [x] **HTTPS Encryption**: All traffic encrypted via TLS (HTTP requests automatically redirected).
- [x] **Input Validation & Sanitization**: FastAPI Pydantic models enforce string length bounds (2 to 5000 chars) to prevent buffer / DOS attacks.
- [x] **Rate Limiting**: Nginx rate-limiting zone restricts scanning requests to `10 req/s` with burst tolerance of `5`.
- [x] **Zero Credential Harvesting**: Client-side and server-side safety checks mask any detected card numbers or sensitive credentials.
- [x] **Database File Permissions**: Ensure `cybershield.db` has `chmod 600` permissions on multi-tenant servers.

---

## 💾 SQLite Database Backup Strategy

To create automated daily backups of your SQLite database:
```bash
# Backup command
sqlite3 /app/backend/cybershield.db ".backup '/app/backend/backups/cybershield_$(date +%Y%m%d).db'"
```
Add to your server crontab (`crontab -e`):
```cron
0 2 * * * sqlite3 /var/www/cybershield/backend/cybershield.db ".backup '/var/www/cybershield/backend/backups/backup_$(date +\%F).db'"
```
