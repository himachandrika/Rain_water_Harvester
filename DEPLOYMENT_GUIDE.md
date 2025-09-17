# 🚀 RTRWH Production Deployment Guide

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- 2GB+ RAM available
- Ports 80, 4000, 5173 available

### 2. Deploy
```bash
# Clone and navigate to project
git clone <your-repo>
cd Chandrika

# Deploy with one command
./deploy.sh
```

### 3. Access
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🔧 Production Optimizations

### Security Features
- ✅ **Helmet.js**: Security headers protection
- ✅ **Rate Limiting**: 100 requests/minute per IP
- ✅ **CORS**: Configurable cross-origin policies
- ✅ **Input Validation**: Zod schema validation
- ✅ **Error Handling**: No sensitive data exposure

### Performance Features
- ✅ **Gzip Compression**: Reduced bandwidth usage
- ✅ **Static Asset Caching**: 1-year cache for assets
- ✅ **Code Splitting**: Optimized bundle sizes
- ✅ **API Caching**: Reduced external API calls
- ✅ **Connection Pooling**: Efficient database connections

### Monitoring Features
- ✅ **Health Checks**: Container health monitoring
- ✅ **Structured Logging**: JSON logs in production
- ✅ **Graceful Shutdown**: Clean container termination
- ✅ **Error Tracking**: Comprehensive error logging

## 📁 Production File Structure

```
Chandrika/
├── deploy.sh                 # One-click deployment script
├── docker-compose.yml        # Production container orchestration
├── nginx.conf               # Reverse proxy configuration
├── env.example              # Environment variables template
├── .env                     # Your production environment (create this)
├── backend/
│   ├── Dockerfile           # Optimized backend container
│   ├── package.json         # Production dependencies
│   └── src/server.ts        # Production-ready server
├── frontend/
│   ├── Dockerfile           # Optimized frontend container
│   ├── vite.config.ts       # Production build configuration
│   └── dist/                # Built frontend assets
└── data/                    # Static data files
```

## ⚙️ Environment Configuration

### Required Environment Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# API Configuration
API_TIMEOUT=15000
API_RETRY_ATTEMPTS=3

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### Optional Environment Variables
```bash
# Caching
CACHE_TTL=3600000
CACHE_MAX_SIZE=1000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/rtrwh
REDIS_URL=redis://localhost:6379
```

## 🐳 Docker Configuration

### Backend Container
- **Base**: Node.js 18 Alpine
- **Port**: 4000
- **Health Check**: /health endpoint
- **Restart Policy**: unless-stopped
- **Memory Limit**: 512MB

### Frontend Container
- **Base**: Nginx Alpine
- **Port**: 80
- **Health Check**: HTTP 200 response
- **Restart Policy**: unless-stopped
- **Memory Limit**: 256MB

### Nginx Container
- **Base**: Nginx Alpine
- **Ports**: 80, 443
- **Features**: Gzip, Rate Limiting, SSL Ready
- **Restart Policy**: unless-stopped
- **Memory Limit**: 128MB

## 📊 Performance Metrics

### Expected Performance
- **API Response Time**: < 3 seconds
- **Frontend Load Time**: < 2 seconds
- **Memory Usage**: < 1GB total
- **CPU Usage**: < 50% under normal load
- **Concurrent Users**: 100+ (with rate limiting)

### Monitoring Commands
```bash
# View container stats
docker stats

# View logs
docker-compose logs -f

# Check health
curl http://localhost:4000/health

# View nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS policies set
- [ ] Security headers enabled
- [ ] Input validation active
- [ ] Error handling secure
- [ ] SSL certificates installed (if using HTTPS)
- [ ] Firewall rules configured
- [ ] Regular security updates

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :80
lsof -i :4000

# Kill the process
sudo kill -9 <PID>
```

#### 2. Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose up --build --force-recreate
```

#### 3. API Not Responding
```bash
# Check backend health
curl http://localhost:4000/health

# Check container status
docker-compose ps

# Restart backend
docker-compose restart backend
```

#### 4. Frontend Not Loading
```bash
# Check nginx logs
docker-compose logs nginx

# Check frontend container
docker-compose logs frontend

# Restart nginx
docker-compose restart nginx
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart containers
docker-compose restart

# Scale down if needed
docker-compose up --scale frontend=1 --scale backend=1
```

#### Slow API Responses
```bash
# Check API logs
docker-compose logs backend

# Check external API status
curl https://archive-api.open-meteo.com/v1/archive

# Restart backend
docker-compose restart backend
```

## 🔄 Maintenance

### Regular Tasks
1. **Monitor logs** for errors
2. **Check health endpoints** daily
3. **Update dependencies** monthly
4. **Backup data** weekly
5. **Review security** quarterly

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Verify deployment
curl http://localhost:4000/health
```

### Scaling
```bash
# Scale backend (if needed)
docker-compose up --scale backend=3 -d

# Scale frontend (if needed)
docker-compose up --scale frontend=2 -d
```

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Check health: `curl http://localhost:4000/health`
3. Review this guide
4. Check GitHub issues
5. Contact support team

---

**Production Ready**: ✅  
**Security Hardened**: ✅  
**Performance Optimized**: ✅  
**Monitoring Enabled**: ✅
