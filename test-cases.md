# 🧪 RTRWH System Test Cases & Boundaries

## Test Case Categories

### 1. Input Validation Tests
### 2. Rainfall Data Tests  
### 3. Groundwater Depth Tests
### 4. Structure Recommendation Tests
### 5. Cost Calculation Tests
### 6. Edge Cases & Boundary Tests

---

## 1. Input Validation Tests

### Latitude Boundaries
```javascript
// Valid Range: -90 to 90
test("Latitude validation", () => {
  expect(validateLatitude(0)).toBe(true);      // Equator
  expect(validateLatitude(28.6139)).toBe(true); // Delhi
  expect(validateLatitude(90)).toBe(true);     // North Pole
  expect(validateLatitude(-90)).toBe(true);    // South Pole
  expect(validateLatitude(91)).toBe(false);    // Invalid
  expect(validateLatitude(-91)).toBe(false);   // Invalid
});
```

### Longitude Boundaries
```javascript
// Valid Range: -180 to 180
test("Longitude validation", () => {
  expect(validateLongitude(0)).toBe(true);      // Prime Meridian
  expect(validateLongitude(77.209)).toBe(true); // Delhi
  expect(validateLongitude(180)).toBe(true);    // International Date Line
  expect(validateLongitude(-180)).toBe(true);   // International Date Line
  expect(validateLongitude(181)).toBe(false);   // Invalid
  expect(validateLongitude(-181)).toBe(false);  // Invalid
});
```

### Roof Area Boundaries
```javascript
// Valid Range: 1 to 10000 m²
test("Roof area validation", () => {
  expect(validateRoofArea(1)).toBe(true);       // Minimum
  expect(validateRoofArea(120)).toBe(true);     // Typical
  expect(validateRoofArea(10000)).toBe(true);   // Maximum
  expect(validateRoofArea(0)).toBe(false);      // Invalid
  expect(validateRoofArea(10001)).toBe(false);  // Invalid
  expect(validateRoofArea(-10)).toBe(false);    // Invalid
});
```

### Collection Efficiency Boundaries
```javascript
// Valid Range: 0.1 to 1.0
test("Collection efficiency validation", () => {
  expect(validateEfficiency(0.1)).toBe(true);   // Minimum
  expect(validateEfficiency(0.9)).toBe(true);   // Typical
  expect(validateEfficiency(1.0)).toBe(true);   // Maximum
  expect(validateEfficiency(0.05)).toBe(false); // Invalid
  expect(validateEfficiency(1.1)).toBe(false);  // Invalid
  expect(validateEfficiency(0)).toBe(false);    // Invalid
});
```

---

## 2. Rainfall Data Tests

### Rainfall Range Boundaries
```javascript
// Expected Range: 0 to 5000 mm/year
test("Rainfall data boundaries", () => {
  // Desert regions
  expect(validateRainfall(0)).toBe(true);       // No rainfall
  expect(validateRainfall(100)).toBe(true);     // Arid
  
  // Typical Indian cities
  expect(validateRainfall(500)).toBe(true);     // Semi-arid
  expect(validateRainfall(1000)).toBe(true);    // Moderate
  expect(validateRainfall(2000)).toBe(true);    // High
  
  // Extreme cases
  expect(validateRainfall(4000)).toBe(true);    // Very high (Cherrapunji)
  expect(validateRainfall(5000)).toBe(true);    // Maximum expected
  expect(validateRainfall(6000)).toBe(false);   // Invalid (too high)
  expect(validateRainfall(-100)).toBe(false);   // Invalid (negative)
});
```

### Monthly Rainfall Distribution
```javascript
test("Monthly rainfall distribution", () => {
  const monthlyData = [0, 0, 5, 10, 50, 200, 400, 300, 150, 20, 5, 0];
  
  // Check sum equals annual
  expect(monthlyData.reduce((a, b) => a + b, 0)).toBe(1140);
  
  // Check no negative values
  expect(monthlyData.every(val => val >= 0)).toBe(true);
  
  // Check reasonable distribution (monsoon months higher)
  expect(monthlyData[6] > monthlyData[0]).toBe(true); // July > January
  expect(monthlyData[7] > monthlyData[11]).toBe(true); // August > December
});
```

---

## 3. Groundwater Depth Tests

### Groundwater Depth Boundaries
```javascript
// Valid Range: 0.5 to 100 m
test("Groundwater depth boundaries", () => {
  expect(validateGroundwaterDepth(0.5)).toBe(true);  // Very shallow
  expect(validateGroundwaterDepth(5)).toBe(true);    // Shallow
  expect(validateGroundwaterDepth(15)).toBe(true);   // Moderate
  expect(validateGroundwaterDepth(50)).toBe(true);   // Deep
  expect(validateGroundwaterDepth(100)).toBe(true);  // Very deep
  expect(validateGroundwaterDepth(0.1)).toBe(false); // Invalid (too shallow)
  expect(validateGroundwaterDepth(101)).toBe(false); // Invalid (too deep)
  expect(validateGroundwaterDepth(-5)).toBe(false);  // Invalid (negative)
});
```

### Aquifer Type Validation
```javascript
test("Aquifer type validation", () => {
  const validTypes = ['Unconfined', 'Confined', 'Semi-confined', 'Unknown'];
  
  expect(validateAquiferType('Unconfined')).toBe(true);
  expect(validateAquiferType('Confined')).toBe(true);
  expect(validateAquiferType('Semi-confined')).toBe(true);
  expect(validateAquiferType('Unknown')).toBe(true);
  expect(validateAquiferType('Invalid')).toBe(false);
  expect(validateAquiferType('')).toBe(false);
});
```

---

## 4. Structure Recommendation Tests

### Recharge Pit Criteria
```javascript
test("Recharge pit recommendation", () => {
  // Should recommend: 5-15m depth, 10m²+ space
  expect(shouldRecommendPit(8, 15)).toBe(true);   // Good conditions
  expect(shouldRecommendPit(12, 20)).toBe(true);  // Good conditions
  expect(shouldRecommendPit(3, 15)).toBe(false);  // Too shallow
  expect(shouldRecommendPit(20, 15)).toBe(false); // Too deep
  expect(shouldRecommendPit(8, 5)).toBe(false);   // Insufficient space
  expect(shouldRecommendPit(8, 10)).toBe(true);   // Minimum space
});
```

### Recharge Trench Criteria
```javascript
test("Recharge trench recommendation", () => {
  // Should recommend: 5-12m depth, 20m²+ space
  expect(shouldRecommendTrench(8, 25)).toBe(true);  // Good conditions
  expect(shouldRecommendTrench(10, 30)).toBe(true); // Good conditions
  expect(shouldRecommendTrench(3, 25)).toBe(false); // Too shallow
  expect(shouldRecommendTrench(15, 25)).toBe(false); // Too deep
  expect(shouldRecommendTrench(8, 15)).toBe(false); // Insufficient space
  expect(shouldRecommendTrench(8, 20)).toBe(true);  // Minimum space
});
```

### Recharge Shaft Criteria
```javascript
test("Recharge shaft recommendation", () => {
  // Should recommend: 8-30m depth, less space needed
  expect(shouldRecommendShaft(10, 5)).toBe(true);   // Good conditions
  expect(shouldRecommendShaft(20, 2)).toBe(true);   // Good conditions
  expect(shouldRecommendShaft(5, 5)).toBe(false);   // Too shallow
  expect(shouldRecommendShaft(35, 5)).toBe(false);  // Too deep
  expect(shouldRecommendShaft(10, 0)).toBe(true);   // No space needed
});
```

---

## 5. Cost Calculation Tests

### Cost Boundaries
```javascript
// Expected Range: ₹10,000 to ₹500,000
test("Cost calculation boundaries", () => {
  // Minimum cost (modular tank only)
  expect(calculateCost(['modular_tank'], 5)).toBeGreaterThan(10000);
  expect(calculateCost(['modular_tank'], 5)).toBeLessThan(50000);
  
  // Maximum cost (all structures)
  expect(calculateCost(['recharge_pit', 'recharge_trench', 'recharge_shaft'], 100)).toBeGreaterThan(100000);
  expect(calculateCost(['recharge_pit', 'recharge_trench', 'recharge_shaft'], 100)).toBeLessThan(500000);
  
  // Invalid inputs
  expect(calculateCost([], 0)).toBe(0);
  expect(calculateCost(['invalid'], 10)).toBe(0);
});
```

### Regional Cost Variations
```javascript
test("Regional cost variations", () => {
  const delhiCost = calculateRegionalCost('IN-DL', ['recharge_pit']);
  const mumbaiCost = calculateRegionalCost('IN-MH', ['recharge_pit']);
  const bangaloreCost = calculateRegionalCost('IN-KA', ['recharge_pit']);
  
  // Costs should be different but reasonable
  expect(delhiCost).toBeGreaterThan(0);
  expect(mumbaiCost).toBeGreaterThan(0);
  expect(bangaloreCost).toBeGreaterThan(0);
  
  // Should not be extremely different
  expect(Math.abs(delhiCost - mumbaiCost) / delhiCost).toBeLessThan(0.5); // Within 50%
});
```

---

## 6. Edge Cases & Boundary Tests

### Extreme Weather Conditions
```javascript
test("Extreme weather conditions", () => {
  // Desert (0mm rainfall)
  expect(calculateHarvest(100, 0, 0.9, 0.9)).toBe(0);
  
  // Very high rainfall (3000mm)
  expect(calculateHarvest(100, 3000, 0.9, 0.9)).toBe(243); // 100 * 3000 * 0.9 * 0.9 * 0.001
  
  // Maximum expected rainfall (5000mm)
  expect(calculateHarvest(100, 5000, 0.9, 0.9)).toBe(405);
});
```

### Extreme Groundwater Conditions
```javascript
test("Extreme groundwater conditions", () => {
  // Very shallow water table (0.5m)
  expect(getRecommendedStructures(0.5, 50)).toEqual(['modular_tank']);
  
  // Very deep water table (80m)
  expect(getRecommendedStructures(80, 5)).toEqual(['recharge_shaft']);
  
  // No open space
  expect(getRecommendedStructures(10, 0)).toEqual(['recharge_shaft']);
});
```

### System Limits
```javascript
test("System limits", () => {
  // Maximum roof area
  expect(calculateHarvest(10000, 1000, 0.9, 0.9)).toBe(8100); // 10,000 * 1000 * 0.9 * 0.9 * 0.001
  
  // Minimum roof area
  expect(calculateHarvest(1, 1000, 0.9, 0.9)).toBe(0.81);
  
  // Maximum efficiency
  expect(calculateHarvest(100, 1000, 1.0, 1.0)).toBe(100); // 100 * 1000 * 1.0 * 1.0 * 0.001
});
```

---

## 7. Real-world Test Cases

### Indian Cities Test Cases
```javascript
const testCities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209, expectedRainfall: [800, 1200], expectedDepth: [5, 15] },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, expectedRainfall: [2000, 3000], expectedDepth: [2, 8] },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, expectedRainfall: [800, 1200], expectedDepth: [10, 25] },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, expectedRainfall: [1200, 1600], expectedDepth: [5, 12] },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, expectedRainfall: [1400, 1800], expectedDepth: [3, 10] }
];

testCities.forEach(city => {
  test(`${city.name} data validation`, async () => {
    const context = await fetchContext(city.lat, city.lon);
    
    expect(context.rainfall_mm_year).toBeGreaterThanOrEqual(city.expectedRainfall[0]);
    expect(context.rainfall_mm_year).toBeLessThanOrEqual(city.expectedRainfall[1]);
    expect(context.groundwater_depth_m).toBeGreaterThanOrEqual(city.expectedDepth[0]);
    expect(context.groundwater_depth_m).toBeLessThanOrEqual(city.expectedDepth[1]);
  });
});
```

---

## 8. Performance Test Cases

### Response Time Boundaries
```javascript
test("API response time boundaries", async () => {
  const start = Date.now();
  const response = await fetch('/api/context?lat=28.6139&lon=77.209');
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
  expect(response.status).toBe(200);
});
```

### Memory Usage Boundaries
```javascript
test("Memory usage boundaries", () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform multiple operations
  for (let i = 0; i < 1000; i++) {
    calculateHarvest(100, 1000, 0.9, 0.9);
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
});
```

---

## 9. Error Handling Test Cases

### API Failure Scenarios
```javascript
test("API failure handling", async () => {
  // Mock API failure
  global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
  
  const response = await fetchContext(28.6139, 77.209);
  
  // Should fallback to mock data
  expect(response.rainfall_mm_year).toBeGreaterThan(0);
  expect(response.groundwater_depth_m).toBeGreaterThan(0);
});
```

### Invalid Input Handling
```javascript
test("Invalid input handling", async () => {
  const invalidInputs = [
    { lat: 'invalid', lon: 77.209 },
    { lat: 28.6139, lon: 'invalid' },
    { lat: 200, lon: 77.209 },
    { lat: 28.6139, lon: 200 }
  ];
  
  for (const input of invalidInputs) {
    const response = await fetchContext(input.lat, input.lon);
    expect(response.error).toBeDefined();
  }
});
```

---

## 10. Validation Functions

```javascript
// Input validation functions
function validateLatitude(lat) {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

function validateLongitude(lon) {
  return typeof lon === 'number' && lon >= -180 && lon <= 180;
}

function validateRoofArea(area) {
  return typeof area === 'number' && area > 0 && area <= 10000;
}

function validateEfficiency(eff) {
  return typeof eff === 'number' && eff >= 0.1 && eff <= 1.0;
}

function validateRainfall(rainfall) {
  return typeof rainfall === 'number' && rainfall >= 0 && rainfall <= 5000;
}

function validateGroundwaterDepth(depth) {
  return typeof depth === 'number' && depth >= 0.5 && depth <= 100;
}

// Structure recommendation functions
function shouldRecommendPit(depth, space) {
  return depth >= 5 && depth <= 15 && space >= 10;
}

function shouldRecommendTrench(depth, space) {
  return depth >= 5 && depth <= 12 && space >= 20;
}

function shouldRecommendShaft(depth, space) {
  return depth >= 8 && depth <= 30;
}

// Cost calculation function
function calculateCost(structures, harvestM3) {
  let cost = 0;
  const costs = {
    recharge_pit: 35000,
    recharge_trench: 25000,
    recharge_shaft: 60000,
    modular_tank: 8000 * Math.min(harvestM3, 20),
    filtration: 15000,
    conveyance: 2500
  };
  
  structures.forEach(structure => {
    if (costs[structure]) {
      cost += costs[structure];
    }
  });
  
  return cost;
}
```

---

## Test Execution

```bash
# Run all tests
npm test

# Run specific test categories
npm test -- --grep "Input Validation"
npm test -- --grep "Rainfall Data"
npm test -- --grep "Structure Recommendation"
npm test -- --grep "Edge Cases"
```

This comprehensive test suite ensures the RTRWH system produces correct outputs for all valid inputs and handles edge cases gracefully.
