# 🌧️ RTRWH & AR Assessment System

**Rooftop Rainwater Harvesting (RTRWH) + Artificial Recharge (AR) Feasibility Assessment**

A production-ready system that provides location-specific analysis for Indian districts and states using real-time weather data and geological information.

## 🚀 Quick Start

### Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev
```

### Deploy to Vercel
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repo.
3. Set up environment variables from `env.example`.
4. Vercel auto-detects frontend/backend and deploys.
5. See `vercel.json` for custom rewrites.

### Deploy to Render
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create two services:
	- **Frontend**: Static site, root `frontend/`, build command `npm install && npm run build`, publish `dist/`.
	- **Backend**: Web service, root `backend/`, build command `npm install && npm run build`, start `npm run start`.
3. Add environment variables from `env.example`.
4. See `render.yaml` for service config.

### Production
```bash
# One-click deployment
./deploy.sh
```

## ✨ Features

- **🗺️ Interactive Map**: Click-to-select coordinates
- **🌧️ Real-time Data**: Open-Meteo API rainfall data
- **💧 Groundwater Analysis**: Depth and aquifer detection
- **🏗️ Structure Recommendations**: Pit, trench, shaft suggestions
- **💰 Cost Estimation**: Regional pricing with all components
- **📊 Dynamic Charts**: Monthly rainfall visualization
- **🌙 Dark Mode**: Toggle between themes
- **🌍 Multi-language**: English and Hindi support
- **📱 Responsive**: Works on all devices

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind + Leaflet
- **Backend**: Node.js + Fastify + Security + Rate Limiting
- **Data**: Open-Meteo API + Groundwater samples + Aquifer data
- **Deployment**: Docker + Nginx + Health checks

## 📁 Project Structure

```
Chandrika/
├── deploy.sh                 # One-click deployment
├── docker-compose.yml        # Production orchestration
├── nginx.conf               # Reverse proxy config
├── env.example              # Environment template
├── README.md                # This file
├── DEPLOYMENT_GUIDE.md      # Production deployment guide
├── SYSTEM_DOCUMENTATION.md  # Complete technical docs
├── backend/                 # Node.js + Fastify API
├── frontend/                # React + TypeScript PWA
└── data/                    # Static data files
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173 (dev) / http://localhost:80 (prod)
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)** - Technical details

## 🔧 Environment

```bash
# Copy and edit environment file
cp env.example .env
```

## 🚀 Production Ready

✅ **Security**: Helmet.js, rate limiting, CORS, input validation  
✅ **Performance**: Gzip, caching, code splitting, minification  
✅ **Monitoring**: Health checks, structured logging, error tracking  
✅ **Scalability**: Docker containers, nginx load balancing  
✅ **Real-time Data**: Live weather and geological data  

## 📄 License

MIT License# Rain_water_harvester
# Rain_water_harvester
