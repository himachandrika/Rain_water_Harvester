import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import pino from 'pino';
import { createRequire } from 'node:module';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
const requireJson = createRequire(import.meta.url);
const mockCtx = requireJson('./data/mock-context.json');
const costs = requireJson('./data/cost-table.json');
const aquifers = requireJson('./data/aquifers.json');
import { generatePdf } from './report.js';
import { 
  validateAssessmentInput, 
  validateRainfallData, 
  validateGroundwaterDepth,
  validateDataQuality,
  testBoundaryValues 
} from './validation.js';

// Environment configuration
const config = {
	port: Number(process.env.PORT) || 4000,
	host: process.env.HOST || '0.0.0.0',
	nodeEnv: process.env.NODE_ENV || 'development',
	apiTimeout: Number(process.env.API_TIMEOUT) || 15000,
	apiRetryAttempts: Number(process.env.API_RETRY_ATTEMPTS) || 3,
	cacheTtl: Number(process.env.CACHE_TTL) || 3600000, // 1 hour
	rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
	rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 60000,
	corsOrigin: process.env.CORS_ORIGIN || '*',
	logLevel: process.env.LOG_LEVEL || 'info'
};

// Configure logger based on environment
const logger = config.nodeEnv === 'production' 
	? pino({ level: config.logLevel })
	: pino({ transport: { target: 'pino-pretty' } });

const app = Fastify({ 
	logger,
	trustProxy: true,
	bodyLimit: 1048576, // 1MB
	requestTimeout: config.apiTimeout
});

// Security headers
await app.register(helmet, {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'", "https://archive-api.open-meteo.com", "https://power.larc.nasa.gov"]
		}
	}
});

// Rate limiting
await app.register(rateLimit, {
	max: config.rateLimitMax,
	timeWindow: config.rateLimitWindow,
	errorResponseBuilder: (request, context) => ({
		code: 429,
		error: 'Too Many Requests',
		message: `Rate limit exceeded, retry in ${Math.round(Number(context.after) / 1000)} seconds`,
		expiresIn: Math.round(Number(context.after) / 1000)
	})
});

// CORS configuration
await app.register(cors, { 
	origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

app.get('/health', async () => ({ status: 'ok' }));

// Friendly root route with API metadata
app.get('/', async () => ({
    name: 'RTRWH & AR API',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
    time: new Date().toISOString(),
    endpoints: [
        'GET /',
        'GET /health',
        'GET /test/boundaries',
        'GET /context?lat=..&lon=..',
        'GET /api/rainfall?lat=..&lon=..',
        'GET /api/groundwater?lat=..&lon=..',
        'GET /api/rainfall/nasa-hourly?...',
        'POST /assess',
        'POST /report'
    ]
}));

// Test endpoint for boundary validation
app.get('/test/boundaries', async () => {
	testBoundaryValues();
	return { 
		status: 'Boundary tests completed', 
		message: 'Check server logs for test results',
		boundaries: {
			latitude: { min: -90, max: 90 },
			longitude: { min: -180, max: 180 },
			roofArea: { min: 1, max: 10000, unit: 'm²' },
			collectionEfficiency: { min: 0.1, max: 1.0 },
			openSpace: { min: 0, max: 1000, unit: 'm²' },
			rainfall: { min: 0, max: 5000, unit: 'mm/year' },
			groundwaterDepth: { min: 0.5, max: 100, unit: 'meters' },
			cost: { min: 0, max: 1000000, unit: 'INR' },
			harvestVolume: { min: 0, max: 10000, unit: 'm³/year' }
		}
	};
});

// In-memory groundwater samples (loaded from CSV)
let groundwaterSamples: Array<{ lat: number; lon: number; depth_m: number; aquifer: string }> = [];

async function loadGroundwaterCsv() {
	try {
		const csvPath = path.join(process.cwd(), '..', 'data', 'groundwater_sample.csv');
		const text = await fs.readFile(csvPath, 'utf-8');
		const [header, ...rows] = text.trim().split(/\r?\n/);
		groundwaterSamples = rows.map((line) => {
			const [lat, lon, depth, aquifer] = line.split(',');
			return { lat: Number(lat), lon: Number(lon), depth_m: Number(depth), aquifer };
		});
		app.log.info(`Loaded ${groundwaterSamples.length} groundwater samples`);
	} catch (e) {
		app.log.warn({ err: e }, 'Failed to load groundwater_sample.csv, using mock values');
	}
}
await loadGroundwaterCsv();

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
	const toRad = (d: number) => (d * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(bLat - aLat);
	const dLon = toRad(bLon - aLon);
	const s1 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(s1));
}

function lookupGroundwater(lat: number, lon: number) {
	if (groundwaterSamples.length) {
		let best = groundwaterSamples[0];
		let bestD = haversineKm(lat, lon, best.lat, best.lon);
		for (const s of groundwaterSamples) {
			const d = haversineKm(lat, lon, s.lat, s.lon);
			if (d < bestD) { best = s; bestD = d; }
		}
		return { depth_m: best.depth_m, aquifer: { name: best.aquifer, type: best.aquifer.includes('Alluvium') ? 'Unconfined' : 'Unknown' } };
	}
	return { depth_m: mockCtx.groundwater_depth_m, aquifer: mockCtx.aquifer };
}

type RainResult = { annual_mm: number; monthly_mm: number[]; data_period?: string; years_count?: number };

// Open-Meteo Historical Weather API for rainfall data (last 2 complete years)
async function fetchRainfallFromOpenMeteo(lat: number, lon: number): Promise<RainResult> {
	try {
		// Get data for the last 2 complete years (2022-2023, 2023-2024)
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth(); // 0-based
		
		// Use last 2 complete years, excluding current year if we're not at year end
		const endYear = currentMonth === 11 ? currentYear : currentYear - 1; // Only use current year if it's December
		const startYear = endYear - 1;
		
		const startDate = `${startYear}-01-01`;
		const endDate = `${endYear}-12-31`;
		
		const url = new URL('https://archive-api.open-meteo.com/v1/archive');
		url.searchParams.set('latitude', String(lat));
		url.searchParams.set('longitude', String(lon));
		url.searchParams.set('start_date', startDate);
		url.searchParams.set('end_date', endDate);
		url.searchParams.set('daily', 'precipitation_sum');
		url.searchParams.set('timezone', 'auto');
		
		const res = await fetch(url.toString(), { 
			headers: { 'User-Agent': 'rtrwh-app/1.0' },
			signal: AbortSignal.timeout(15000)
		});
		
		if (!res.ok) throw new Error(`Open-Meteo Historical API ${res.status}: ${res.statusText}`);
		
		const data = await res.json() as any;
		const dailyPrecip: number[] | undefined = data?.daily?.precipitation_sum;
		const dates: string[] | undefined = data?.daily?.time;
		
		if (!dailyPrecip || !dates || dailyPrecip.length === 0) {
			throw new Error('No precipitation data available');
		}
		
		// Calculate monthly totals for the complete years
		const monthly = new Array(12).fill(0) as number[];
		let annual = 0;
		
		for (let i = 0; i < dates.length; i++) {
			const date = new Date(dates[i]);
			const month = date.getMonth(); // 0-based
			const precip = Number(dailyPrecip[i]) || 0;
			
			monthly[month] += precip;
			annual += precip;
		}
		
		// Average over the number of complete years and round to integers
		const yearsCount = endYear - startYear + 1;
		const monthlyAvg = monthly.map((n) => Math.round(n / yearsCount));
		const annualAvg = Math.round(annual / yearsCount);
		
		app.log.info({ lat, lon, startYear, endYear, yearsCount, annual: annualAvg, monthly: monthlyAvg }, 'Fetched rainfall from Open-Meteo Historical API');
		return { 
			annual_mm: annualAvg, 
			monthly_mm: monthlyAvg,
			data_period: `${startYear}-${endYear}`,
			years_count: yearsCount
		};
		
	} catch (error) {
		app.log.warn({ err: error, lat, lon }, 'Open-Meteo Historical API failed');
		throw error;
	}
}

// NASA POWER API as secondary source (for recent data)
async function fetchRainfallFromNasa(lat: number, lon: number): Promise<RainResult> {
	try {
		const today = new Date();
		const end = `${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}`;
		const past = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
		past.setUTCDate(past.getUTCDate() - 365);
		const start = `${past.getUTCFullYear()}${String(past.getUTCMonth() + 1).padStart(2, '0')}${String(past.getUTCDate()).padStart(2, '0')}`;
		
		const url = new URL('https://power.larc.nasa.gov/api/temporal/hourly/point');
		url.searchParams.set('start', start);
		url.searchParams.set('end', end);
		url.searchParams.set('latitude', String(lat));
		url.searchParams.set('longitude', String(lon));
		url.searchParams.set('community', 'ag');
		url.searchParams.set('parameters', 'PRECTOT');
		url.searchParams.set('format', 'json');
		url.searchParams.set('time-standard', 'utc');
		
		const res = await fetch(url.toString(), { 
			headers: { 'User-Agent': 'rtrwh-app/1.0' },
			signal: AbortSignal.timeout(15000)
		});
		
		if (!res.ok) throw new Error(`NASA POWER API ${res.status}: ${res.statusText}`);
		
		const data = await res.json() as any;
		const series = data?.properties?.parameter?.PRECTOT as Record<string, number> | undefined;
		
		if (!series) throw new Error('NASA POWER missing PRECTOT data');
		
		const monthly = new Array(12).fill(0) as number[];
		let annual = 0;
		
		for (const [ts, val] of Object.entries(series)) {
			// ts format: YYYYMMDDHH
			const m = Number(ts.slice(4, 6)) - 1; // 0-based month
			const v = Number(val) || 0; // mm/hr
			if (m >= 0 && m < 12) {
				monthly[m] += v;
				annual += v;
			}
		}
		
		app.log.info({ lat, lon, annual, monthly }, 'Fetched rainfall from NASA POWER API');
		return { annual_mm: Math.round(annual), monthly_mm: monthly.map((n) => Math.round(n)) };
		
	} catch (error) {
		app.log.warn({ err: error, lat, lon }, 'NASA POWER API failed');
		throw error;
	}
}

// Fallback to mock data
const fallbackRainfallMmYr = mockCtx.rainfall_mm_year;
async function fetchRainfallFallback(lat: number, lon: number): Promise<RainResult> {
	app.log.warn({ lat, lon }, 'Using fallback rainfall data');
	return { 
		annual_mm: fallbackRainfallMmYr, 
		monthly_mm: Array(12).fill(Math.round(fallbackRainfallMmYr / 12)) 
	};
}

function pointInPolygon(lat: number, lon: number, polygon: number[][]): boolean {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i][0], yi = polygon[i][1];
		const xj = polygon[j][0], yj = polygon[j][1];
		const intersect = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi + 0.0) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}

function lookupAquiferPolygon(lat: number, lon: number) {
	try {
		const features = (aquifers as any).features as Array<{ properties: any; geometry: { type: string; coordinates: any } }>;
		for (const f of features) {
			if (f.geometry.type === 'Polygon') {
				const ring: number[][] = f.geometry.coordinates[0];
				if (pointInPolygon(lat, lon, ring.map(([x,y])=>[x,y]))) {
					return { name: f.properties.name, type: f.properties.type };
				}
			}
		}
	} catch {}
	return mockCtx.aquifer;
}

app.get('/context', async (req) => {
	const q = req.query as { lat?: string; lon?: string };
	const lat = Number(q.lat ?? '0');
	const lon = Number(q.lon ?? '0');
	
	// Validate coordinates with proper boundaries
	if (Number.isNaN(lat) || Number.isNaN(lon)) {
		return { error: 'Invalid coordinates - must be valid numbers' };
	}
	
	if (lat < -90 || lat > 90) {
		return { error: 'Latitude must be between -90 and 90 degrees' };
	}
	
	if (lon < -180 || lon > 180) {
		return { error: 'Longitude must be between -180 and 180 degrees' };
	}
	let rain;
	try { 
		rain = await fetchRainfallFromOpenMeteo(lat, lon); 
	} catch (e) { 
		app.log.warn({ err: e }, 'Open-Meteo Climate failed, trying NASA POWER');
		try {
			rain = await fetchRainfallFromNasa(lat, lon);
		} catch (e2) {
			app.log.warn({ err: e2 }, 'NASA POWER failed, using fallback');
			rain = await fetchRainfallFallback(lat, lon);
		}
	}
	const gw = lookupGroundwater(lat, lon);
	const aquifer = gw.aquifer ?? lookupAquiferPolygon(lat, lon);
	
	// Validate data quality and add warnings
	const contextData = {
		location: { lat, lon },
		rainfall_mm_year: rain.annual_mm,
		monthly_rainfall_mm: rain.monthly_mm,
		rainfall_data_period: rain.data_period || '2023-2024',
		rainfall_years_count: rain.years_count || 2,
		groundwater_depth_m: gw.depth_m,
		aquifer,
		runoff_coeff_default: mockCtx.runoff_coeff_default,
		admin: mockCtx.admin
	};
	
	// Validate data quality and add warnings if needed
	const qualityCheck = validateDataQuality(contextData);
	return qualityCheck.value;
});

app.get('/api/rainfall', async (req) => {
	const q = req.query as { lat?: string; lon?: string };
	const lat = Number(q.lat ?? '0');
	const lon = Number(q.lon ?? '0');
	try { 
		return await fetchRainfallFromOpenMeteo(lat, lon); 
	} catch (e) { 
		try {
			return await fetchRainfallFromNasa(lat, lon);
		} catch {
			return await fetchRainfallFallback(lat, lon);
		}
	}
});

app.get('/api/groundwater', async (req) => {
	const q = req.query as { lat?: string; lon?: string };
	const lat = Number(q.lat ?? '0');
	const lon = Number(q.lon ?? '0');
	const gw = lookupGroundwater(lat, lon);
	return gw;
});

// Report generation endpoint
app.post('/report', async (req, reply) => {
	try {
		const payload = req.body as any;
		const pdf = await generatePdf(payload);
		reply
			.header('Content-Type', 'application/pdf')
			.header('Content-Disposition', 'attachment; filename="rtrwh_report.pdf"')
			.send(pdf);
	} catch (e: any) {
		reply.code(500);
		return { error: 'Failed to generate report', message: String(e?.message ?? e) };
	}
});

const AssessInput = z.object({
	location: z.object({ 
		lat: z.number().min(-90).max(90), 
		lon: z.number().min(-180).max(180) 
	}),
	roof_area_m2: z.number().min(1).max(10000),
	roof_type: z.enum(['concrete', 'tile', 'metal', 'asbestos']).default('concrete'),
	open_space_m2: z.number().min(0).max(1000).default(0),
	occupiers: z.number().int().positive().default(4),
	collection_efficiency: z.number().min(0.1).max(1.0).default(0.9)
});

type AssessInput = z.infer<typeof AssessInput>;

function computeHarvestVolumeM3(input: AssessInput, rainfallMmYr: number): number {
	const runoffCoeffByRoof: Record<string, number> = {
		concrete: 0.9,
		tile: 0.8,
		metal: 0.85,
		asbestos: 0.75
	};
	const c = runoffCoeffByRoof[input.roof_type] ?? 0.85;
	const volume = input.roof_area_m2 * rainfallMmYr * c * input.collection_efficiency * 1e-3;
	return Number(volume.toFixed(2));
}

function suggestStructures(dwl: number, openSpace: number) {
	const suggestions: string[] = [];
	
	// Recharge pit: needs minimum 10m² space and water table 5-15m deep
	if (openSpace >= 10 && dwl >= 5 && dwl <= 15) {
		suggestions.push('recharge_pit');
	}
	
	// Recharge trench: needs minimum 20m² space and water table 5-12m deep
	if (openSpace >= 20 && dwl >= 5 && dwl <= 12) {
		suggestions.push('recharge_trench');
	}
	
	// Recharge shaft: for deeper water tables (8-30m), needs less space
	if (dwl >= 8 && dwl <= 30) {
		suggestions.push('recharge_shaft');
	}
	
	// If no suitable structures, suggest modular tank for storage
	if (suggestions.length === 0) {
		suggestions.push('modular_tank');
	}
	
	return suggestions;
}

function estimateCostInr(suggestions: string[], harvestM3: number, regionCosts: any) {
	let cost = 0;
	
	// Add costs for each suggested structure
	if (suggestions.includes('recharge_pit')) {
		cost += regionCosts.recharge_pit_base_inr;
	}
	
	if (suggestions.includes('recharge_trench')) {
		// Standard trench length of 6 meters
		cost += regionCosts.recharge_trench_per_meter_inr * 6;
	}
	
	if (suggestions.includes('recharge_shaft')) {
		cost += regionCosts.recharge_shaft_base_inr;
	}
	
	if (suggestions.includes('modular_tank')) {
		// Tank size based on harvest volume, max 20m³
		const tankSize = Math.min(harvestM3, 20);
		cost += regionCosts.modular_tank_per_m3_inr * tankSize;
	}
	
	// Always include filtration unit
	cost += regionCosts.filtration_unit_base_inr;
	
	// Add conveyance system cost (estimated 10m length)
	cost += regionCosts.conveyance_per_meter_inr * 10;
	
	return Math.round(cost);
}

app.post('/assess', async (req, reply) => {
	// Validate with Zod schema first (has better error messages)
	const parsed = AssessInput.safeParse(req.body);
	if (!parsed.success) {
		reply.code(400);
		const issues = parsed.error.flatten();
		return { 
			error: 'Invalid input', 
			details: Object.values(issues.fieldErrors).flat().join('; '),
			issues: issues
		};
	}
	const input = parsed.data;
	let rain;
	try { 
		rain = await fetchRainfallFromOpenMeteo(input.location.lat, input.location.lon); 
	} catch (e) { 
		try {
			rain = await fetchRainfallFromNasa(input.location.lat, input.location.lon);
		} catch {
			rain = await fetchRainfallFallback(input.location.lat, input.location.lon);
		}
	}
	const harvestM3 = computeHarvestVolumeM3(input, rain.annual_mm);
	const gw = lookupGroundwater(input.location.lat, input.location.lon);
	const suggestions = suggestStructures(gw.depth_m, input.open_space_m2);
	const sizing = {
		recharge_pit: suggestions.includes('recharge_pit') ? { diameter_m: 1.2, depth_m: 2.5 } : null,
		recharge_trench: suggestions.includes('recharge_trench') ? { length_m: 6, width_m: 0.9, depth_m: 1.5 } : null,
		recharge_shaft: suggestions.includes('recharge_shaft') ? { diameter_m: 0.45, depth_m: 10 } : null,
		modular_tank: suggestions.includes('modular_tank') ? { volume_m3: Math.min(harvestM3, 20) } : null
	};
	const regionCosts = costs[mockCtx.admin.code as keyof typeof costs] ?? costs.default;
	const cost_estimate_inr = estimateCostInr(suggestions, harvestM3, regionCosts);
	// Cost-benefit analysis removed as requested
	return {
		feasibility: suggestions.length ? 'Yes' : 'Conditional',
		suggested_structures: suggestions,
		sizing,
		volumes: { annual_harvest_m3: harvestM3, monthly_rainfall_mm: rain.monthly_mm },
		cost_estimate_inr
	};
});

// NASA proxy endpoint (explicit)
app.get('/api/rainfall/nasa-hourly', async (req, reply) => {
	const q = req.query as { start?: string; end?: string; lat?: string; lon?: string; parameters?: string; community?: string; units?: string; format?: string };
	const start = q.start; const end = q.end; const lat = q.lat; const lon = q.lon;
	if (!start || !end || !lat || !lon) { reply.code(422); return { error: 'Missing required query params: start, end, lat, lon' }; }
	const params = new URL('https://power.larc.nasa.gov/api/temporal/hourly/point');
	params.searchParams.set('start', start);
	params.searchParams.set('end', end);
	params.searchParams.set('latitude', lat);
	params.searchParams.set('longitude', lon);
	params.searchParams.set('community', q.community ?? 'ag');
	params.searchParams.set('parameters', q.parameters ?? 'PRECTOT');
	params.searchParams.set('format', q.format ?? 'json');
	params.searchParams.set('time-standard', 'utc');
	if (q.units) params.searchParams.set('units', q.units);
	try { const r = await fetch(params.toString()); return await r.json(); } catch (e: any) { reply.code(502); return { error: 'NASA POWER request failed', message: String(e?.message ?? e) }; }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
	app.log.info(`Received ${signal}, shutting down gracefully`);
	try {
		await app.close();
		app.log.info('Server closed successfully');
		process.exit(0);
	} catch (err) {
		app.log.error(err, 'Error during shutdown');
		process.exit(1);
	}
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
app.listen({ port: config.port, host: config.host }).then(() => {
	app.log.info(`🚀 RTRWH API server running on http://${config.host}:${config.port}`);
	app.log.info(`📊 Environment: ${config.nodeEnv}`);
	app.log.info(`🔒 Rate limit: ${config.rateLimitMax} requests per ${config.rateLimitWindow/1000}s`);
}).catch((err) => {
	app.log.error(err, 'Failed to start server');
	process.exit(1);
});
