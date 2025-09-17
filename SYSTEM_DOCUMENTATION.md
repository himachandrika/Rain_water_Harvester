# RTRWH & AR Assessment System - Complete Documentation

## 🎯 System Overview

This is a **Rooftop Rainwater Harvesting (RTRWH) + Artificial Recharge (AR) Feasibility Assessment** system that provides location-specific analysis for Indian districts and states. The system uses real-time weather data and geological information to recommend optimal recharge structures.

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Location**: `frontend/`
- **Port**: 5173
- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, Leaflet Maps, Chart.js

### Backend (Node.js + TypeScript + Fastify)
- **Location**: `backend/`
- **Port**: 4000
- **Tech Stack**: Fastify, TypeScript, Zod validation, Puppeteer (PDF generation)

### Data Sources
- **Rainfall**: Open-Meteo Historical API (2023-2024 data)
- **Groundwater**: Sample CSV with district-wise data
- **Aquifers**: GeoJSON polygon data

## 📁 File Structure & Core Logic

### Backend Files

#### `backend/src/server.ts` - Main API Server
**Core Logic:**
- Fetches real-time rainfall data from Open-Meteo API
- Performs groundwater depth lookup by coordinates
- Calculates rainwater harvest potential
- Recommends recharge structures based on geological conditions
- Estimates costs using regional pricing

**Key Functions:**
```typescript
// Rainfall data fetching (real-time)
fetchRainfallFromOpenMeteo(lat, lon) → {annual_mm, monthly_mm, data_period}

// Groundwater lookup by nearest sample
lookupGroundwater(lat, lon) → {depth_m, aquifer}

// Harvest volume calculation
computeHarvestVolumeM3(input, rainfallMmYr) → volume_m3

// Structure recommendation
suggestStructures(dwl, openSpace) → [structure_types]

// Cost estimation
estimateCostInr(suggestions, harvestM3, regionCosts) → cost_inr
```

**API Endpoints:**
- `GET /context?lat=X&lon=Y` - Get location context (rainfall, groundwater, aquifer)
- `POST /assess` - Perform feasibility assessment
- `GET /api/rainfall?lat=X&lon=Y` - Get rainfall data only
- `GET /api/groundwater?lat=X&lon=Y` - Get groundwater data only

#### `backend/src/data/cost-table.json` - Regional Cost Data
**Structure:**
```json
{
  "IN-XX-001": {
    "recharge_pit_base_inr": 35000,
    "recharge_trench_per_meter_inr": 4200,
    "recharge_shaft_base_inr": 60000,
    "modular_tank_per_m3_inr": 8000,
    "filtration_unit_base_inr": 15000,
    "conveyance_per_meter_inr": 250
  }
}
```

#### `backend/src/data/aquifers.json` - Aquifer Boundaries
**Structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": { "name": "Alluvium (Delhi)", "type": "Unconfined" },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```

### Frontend Files

#### `frontend/src/App.tsx` - Main Application
**Core Logic:**
- Manages user input (location, roof area, roof type, etc.)
- Fetches context data and performs assessments
- Displays results with interactive charts
- Handles geolocation and map interactions

**State Management:**
```typescript
const [lat, setLat] = useState(28.6139);
const [lon, setLon] = useState(77.209);
const [roofArea, setRoofArea] = useState(120);
const [roofType, setRoofType] = useState('concrete');
const [openSpace, setOpenSpace] = useState(20);
const [collectionEfficiency, setCollectionEfficiency] = useState(0.9);
```

#### `frontend/src/components/LeafletMap.tsx` - Interactive Map
**Core Logic:**
- Displays OpenStreetMap tiles
- Allows click-to-select coordinates
- Updates lat/lon fields automatically
- Shows marker for selected location

#### `frontend/src/components/RainChart.tsx` - Rainfall Visualization
**Core Logic:**
- Displays monthly rainfall data as bar chart
- Shows data period and year count
- Only displays completed months (no future data)
- Uses Chart.js for visualization

### Data Files

#### `data/groundwater_sample.csv` - Groundwater Data
**Structure:**
```csv
lat,lon,depth_m,aquifer
28.61,77.21,9.5,Alluvium (Delhi)
19.07,72.88,12,Deccan Traps (Basalt)
12.97,77.59,15,Granite-Gneiss
```

## 🔄 Core Algorithm Flow

### 1. Location Input
**User provides:**
- Latitude/Longitude (via map click or manual input)
- Roof area (m²)
- Roof type (concrete/tile/metal/asbestos)
- Open space available (m²)
- Collection efficiency (0.0-1.0)

### 2. Data Fetching
**System fetches:**
- **Rainfall Data**: 2-year historical average from Open-Meteo API
- **Groundwater Depth**: Nearest sample point from CSV
- **Aquifer Type**: Polygon intersection or nearest sample

### 3. Harvest Calculation
**Formula:**
```
Annual Harvest (m³) = Roof Area (m²) × Annual Rainfall (mm) × Runoff Coefficient × Collection Efficiency × 0.001
```

**Runoff Coefficients:**
- Concrete: 0.9
- Tile: 0.8
- Metal: 0.85
- Asbestos: 0.75

### 4. Structure Recommendation
**Criteria:**
- **Recharge Pit**: 5-15m depth, 10m²+ space
- **Recharge Trench**: 5-12m depth, 20m²+ space
- **Recharge Shaft**: 8-30m depth, less space needed
- **Modular Tank**: Fallback option

### 5. Cost Estimation
**Components:**
- Structure costs (pit, trench, shaft, tank)
- Filtration unit: ₹15,000
- Conveyance system: 10m × ₹250 = ₹2,500
- Regional pricing variations

## 📊 Input Fields & Values

### Required Inputs
| Field | Type | Range | Default | Description |
|-------|------|-------|---------|-------------|
| Latitude | number | -90 to 90 | 28.6139 | GPS latitude coordinate |
| Longitude | number | -180 to 180 | 77.209 | GPS longitude coordinate |
| Roof Area | number | > 0 | 120 | Roof area in square meters |
| Roof Type | enum | concrete/tile/metal/asbestos | concrete | Type of roof material |
| Open Space | number | ≥ 0 | 20 | Available space for structures (m²) |
| Collection Efficiency | number | 0.0-1.0 | 0.9 | Efficiency of collection system |

### Optional Inputs
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Occupiers | number | 4 | Number of people (for future use) |

## 📈 Output Fields & Values

### Context Data
| Field | Type | Example | Description |
|-------|------|---------|-------------|
| rainfall_mm_year | number | 931 | Annual rainfall in mm |
| monthly_rainfall_mm | array | [29,20,42...] | Monthly rainfall distribution |
| rainfall_data_period | string | "2023-2024" | Data source period |
| rainfall_years_count | number | 2 | Number of years averaged |
| groundwater_depth_m | number | 9.5 | Water table depth in meters |
| aquifer.name | string | "Alluvium (Delhi)" | Aquifer type name |
| aquifer.type | string | "Unconfined" | Aquifer classification |

### Assessment Results
| Field | Type | Example | Description |
|-------|------|---------|-------------|
| feasibility | string | "Yes" | Feasibility status |
| suggested_structures | array | ["recharge_pit", "recharge_trench"] | Recommended structures |
| annual_harvest_m3 | number | 90.49 | Annual water harvest in m³ |
| cost_estimate_inr | number | 137700 | Total cost in Indian Rupees |

### Structure Sizing
| Structure | Fields | Example | Description |
|-----------|--------|---------|-------------|
| recharge_pit | diameter_m, depth_m | 1.2, 2.5 | Pit dimensions |
| recharge_trench | length_m, width_m, depth_m | 6, 0.9, 1.5 | Trench dimensions |
| recharge_shaft | diameter_m, depth_m | 0.45, 10 | Shaft dimensions |
| modular_tank | volume_m3 | 20 | Tank capacity |

## 🔧 Technical Specifications

### Data Sources
1. **Open-Meteo Historical API**
   - URL: `https://archive-api.open-meteo.com/v1/archive`
   - Data: 2023-2024 daily precipitation
   - Processing: Monthly aggregation, 2-year average

2. **Groundwater Sample Data**
   - Source: CSV file with 6 sample points
   - Lookup: Nearest neighbor by haversine distance
   - Coverage: Major Indian cities

3. **Aquifer Data**
   - Source: GeoJSON polygon features
   - Lookup: Point-in-polygon intersection
   - Fallback: Nearest sample point

### Performance Optimizations
- **Caching**: API responses cached for 1 hour
- **Parallel Processing**: Multiple API calls in parallel
- **Error Handling**: Graceful fallbacks for API failures
- **Validation**: Zod schema validation for all inputs

### Security Features
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Configured for frontend access
- **Rate Limiting**: Built-in Fastify rate limiting
- **Error Handling**: No sensitive data in error messages

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Production
```bash
# Using Docker
docker-compose up -d
```

## 📋 API Documentation

### GET /context
**Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude

**Response:**
```json
{
  "location": {"lat": 28.6139, "lon": 77.209},
  "rainfall_mm_year": 931,
  "monthly_rainfall_mm": [29, 20, 42, ...],
  "rainfall_data_period": "2023-2024",
  "rainfall_years_count": 2,
  "groundwater_depth_m": 9.5,
  "aquifer": {"name": "Alluvium (Delhi)", "type": "Unconfined"},
  "runoff_coeff_default": 0.85,
  "admin": {"name": "Sample District", "code": "IN-XX-001"}
}
```

### POST /assess
**Request Body:**
```json
{
  "location": {"lat": 28.6139, "lon": 77.209},
  "roof_area_m2": 120,
  "roof_type": "concrete",
  "open_space_m2": 20,
  "collection_efficiency": 0.9
}
```

**Response:**
```json
{
  "feasibility": "Yes",
  "suggested_structures": ["recharge_pit", "recharge_trench", "recharge_shaft"],
  "sizing": {
    "recharge_pit": {"diameter_m": 1.2, "depth_m": 2.5},
    "recharge_trench": {"length_m": 6, "width_m": 0.9, "depth_m": 1.5},
    "recharge_shaft": {"diameter_m": 0.45, "depth_m": 10}
  },
  "volumes": {
    "annual_harvest_m3": 90.49,
    "monthly_rainfall_mm": [29, 20, 42, ...]
  },
  "cost_estimate_inr": 137700
}
```

## 🎯 Key Features

1. **Real-time Data**: Uses live weather APIs for accurate rainfall data
2. **Location-specific**: Different results for different coordinates
3. **Interactive Map**: Click-to-select location with visual feedback
4. **Dynamic Charts**: Monthly rainfall visualization with proper scaling
5. **Responsive Design**: Works on desktop and mobile devices
6. **Dark Mode**: Toggle between light and dark themes
7. **Internationalization**: English and Hindi language support
8. **PDF Reports**: Download assessment results as PDF
9. **Error Handling**: Graceful fallbacks for API failures
10. **Validation**: Comprehensive input validation and sanitization

## 🔍 Troubleshooting

### Common Issues
1. **Map not loading**: Check browser console for CORS errors
2. **No rainfall data**: API might be down, check fallback data
3. **Wrong coordinates**: Ensure lat/lon are within valid ranges
4. **High costs**: Check if multiple structures are recommended

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in backend environment.

---

**System Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: RTRWH Development Team
