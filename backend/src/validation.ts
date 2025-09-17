// RTRWH System Validation Functions
// Comprehensive input validation with boundaries and limits

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: any;
}

// Input validation functions with proper boundaries
export function validateLatitude(lat: any): ValidationResult {
  if (typeof lat !== 'number' || isNaN(lat)) {
    return { isValid: false, error: 'Latitude must be a valid number' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }
  
  return { isValid: true, value: lat };
}

export function validateLongitude(lon: any): ValidationResult {
  if (typeof lon !== 'number' || isNaN(lon)) {
    return { isValid: false, error: 'Longitude must be a valid number' };
  }
  
  if (lon < -180 || lon > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }
  
  return { isValid: true, value: lon };
}

export function validateRoofArea(area: any): ValidationResult {
  if (typeof area !== 'number' || isNaN(area)) {
    return { isValid: false, error: 'Roof area must be a valid number' };
  }
  
  if (area <= 0) {
    return { isValid: false, error: 'Roof area must be greater than 0' };
  }
  
  if (area > 10000) {
    return { isValid: false, error: 'Roof area cannot exceed 10,000 m²' };
  }
  
  return { isValid: true, value: area };
}

export function validateCollectionEfficiency(eff: any): ValidationResult {
  if (typeof eff !== 'number' || isNaN(eff)) {
    return { isValid: false, error: 'Collection efficiency must be a valid number' };
  }
  
  if (eff < 0.1) {
    return { isValid: false, error: 'Collection efficiency cannot be less than 0.1 (10%)' };
  }
  
  if (eff > 1.0) {
    return { isValid: false, error: 'Collection efficiency cannot exceed 1.0 (100%)' };
  }
  
  return { isValid: true, value: eff };
}

export function validateOpenSpace(space: any): ValidationResult {
  if (typeof space !== 'number' || isNaN(space)) {
    return { isValid: false, error: 'Open space must be a valid number' };
  }
  
  if (space < 0) {
    return { isValid: false, error: 'Open space cannot be negative' };
  }
  
  if (space > 1000) {
    return { isValid: false, error: 'Open space cannot exceed 1,000 m²' };
  }
  
  return { isValid: true, value: space };
}

export function validateRoofType(roofType: any): ValidationResult {
  const validTypes = ['concrete', 'tile', 'metal', 'asbestos'];
  
  if (typeof roofType !== 'string') {
    return { isValid: false, error: 'Roof type must be a string' };
  }
  
  if (!validTypes.includes(roofType)) {
    return { isValid: false, error: `Roof type must be one of: ${validTypes.join(', ')}` };
  }
  
  return { isValid: true, value: roofType };
}

// Rainfall data validation
export function validateRainfallData(rainfall: any): ValidationResult {
  if (typeof rainfall !== 'number' || isNaN(rainfall)) {
    return { isValid: false, error: 'Rainfall must be a valid number' };
  }
  
  if (rainfall < 0) {
    return { isValid: false, error: 'Rainfall cannot be negative' };
  }
  
  if (rainfall > 5000) {
    return { isValid: false, error: 'Rainfall cannot exceed 5,000 mm/year' };
  }
  
  return { isValid: true, value: rainfall };
}

export function validateMonthlyRainfall(monthly: any): ValidationResult {
  if (!Array.isArray(monthly)) {
    return { isValid: false, error: 'Monthly rainfall must be an array' };
  }
  
  if (monthly.length !== 12) {
    return { isValid: false, error: 'Monthly rainfall must have exactly 12 values' };
  }
  
  for (let i = 0; i < monthly.length; i++) {
    if (typeof monthly[i] !== 'number' || isNaN(monthly[i])) {
      return { isValid: false, error: `Monthly rainfall value at index ${i} must be a valid number` };
    }
    
    if (monthly[i] < 0) {
      return { isValid: false, error: `Monthly rainfall value at index ${i} cannot be negative` };
    }
    
    if (monthly[i] > 1000) {
      return { isValid: false, error: `Monthly rainfall value at index ${i} cannot exceed 1,000 mm` };
    }
  }
  
  return { isValid: true, value: monthly };
}

// Groundwater data validation
export function validateGroundwaterDepth(depth: any): ValidationResult {
  if (typeof depth !== 'number' || isNaN(depth)) {
    return { isValid: false, error: 'Groundwater depth must be a valid number' };
  }
  
  if (depth < 0.5) {
    return { isValid: false, error: 'Groundwater depth cannot be less than 0.5 meters' };
  }
  
  if (depth > 100) {
    return { isValid: false, error: 'Groundwater depth cannot exceed 100 meters' };
  }
  
  return { isValid: true, value: depth };
}

export function validateAquiferType(aquiferType: any): ValidationResult {
  const validTypes = ['Unconfined', 'Confined', 'Semi-confined', 'Unknown'];
  
  if (typeof aquiferType !== 'string') {
    return { isValid: false, error: 'Aquifer type must be a string' };
  }
  
  if (!validTypes.includes(aquiferType)) {
    return { isValid: false, error: `Aquifer type must be one of: ${validTypes.join(', ')}` };
  }
  
  return { isValid: true, value: aquiferType };
}

// Structure recommendation validation
export function validateStructureRecommendation(structures: any): ValidationResult {
  if (!Array.isArray(structures)) {
    return { isValid: false, error: 'Structures must be an array' };
  }
  
  const validStructures = ['recharge_pit', 'recharge_trench', 'recharge_shaft', 'modular_tank'];
  
  for (const structure of structures) {
    if (!validStructures.includes(structure)) {
      return { isValid: false, error: `Invalid structure type: ${structure}` };
    }
  }
  
  return { isValid: true, value: structures };
}

// Cost validation
export function validateCost(cost: any): ValidationResult {
  if (typeof cost !== 'number' || isNaN(cost)) {
    return { isValid: false, error: 'Cost must be a valid number' };
  }
  
  if (cost < 0) {
    return { isValid: false, error: 'Cost cannot be negative' };
  }
  
  if (cost > 1000000) {
    return { isValid: false, error: 'Cost cannot exceed ₹1,000,000' };
  }
  
  return { isValid: true, value: cost };
}

// Harvest volume validation
export function validateHarvestVolume(volume: any): ValidationResult {
  if (typeof volume !== 'number' || isNaN(volume)) {
    return { isValid: false, error: 'Harvest volume must be a valid number' };
  }
  
  if (volume < 0) {
    return { isValid: false, error: 'Harvest volume cannot be negative' };
  }
  
  if (volume > 10000) {
    return { isValid: false, error: 'Harvest volume cannot exceed 10,000 m³/year' };
  }
  
  return { isValid: true, value: volume };
}

// Comprehensive input validation
export function validateAssessmentInput(input: any): ValidationResult {
  const errors: string[] = [];
  
  // Validate location
  const latResult = validateLatitude(input.location?.lat);
  if (!latResult.isValid) errors.push(latResult.error!);
  
  const lonResult = validateLongitude(input.location?.lon);
  if (!lonResult.isValid) errors.push(lonResult.error!);
  
  // Validate roof area
  const areaResult = validateRoofArea(input.roof_area_m2);
  if (!areaResult.isValid) errors.push(areaResult.error!);
  
  // Validate roof type
  const roofTypeResult = validateRoofType(input.roof_type);
  if (!roofTypeResult.isValid) errors.push(roofTypeResult.error!);
  
  // Validate open space
  const spaceResult = validateOpenSpace(input.open_space_m2);
  if (!spaceResult.isValid) errors.push(spaceResult.error!);
  
  // Validate collection efficiency
  const effResult = validateCollectionEfficiency(input.collection_efficiency);
  if (!effResult.isValid) errors.push(effResult.error!);
  
  if (errors.length > 0) {
    return { isValid: false, error: errors.join('; ') };
  }
  
  return { isValid: true, value: input };
}

// Data quality validation
export function validateDataQuality(data: any): ValidationResult {
  const warnings: string[] = [];
  
  // Check rainfall data quality
  if (data.rainfall_mm_year < 100) {
    warnings.push('Very low rainfall detected - may affect feasibility');
  }
  
  if (data.rainfall_mm_year > 3000) {
    warnings.push('Very high rainfall detected - ensure proper drainage');
  }
  
  // Check groundwater depth quality
  if (data.groundwater_depth_m < 2) {
    warnings.push('Very shallow water table - consider flood risk');
  }
  
  if (data.groundwater_depth_m > 50) {
    warnings.push('Very deep water table - recharge may be challenging');
  }
  
  // Check monthly distribution
  if (data.monthly_rainfall_mm) {
    const maxMonth = Math.max(...data.monthly_rainfall_mm);
    const minMonth = Math.min(...data.monthly_rainfall_mm);
    
    if (maxMonth / minMonth > 20) {
      warnings.push('Extreme seasonal variation in rainfall');
    }
  }
  
  return { 
    isValid: true, 
    value: { ...data, warnings: warnings.length > 0 ? warnings : undefined }
  };
}

// Boundary value testing
export function testBoundaryValues(): void {
  console.log('Testing boundary values...');
  
  // Test latitude boundaries
  console.log('Latitude -90:', validateLatitude(-90).isValid); // Should be true
  console.log('Latitude 90:', validateLatitude(90).isValid);   // Should be true
  console.log('Latitude -91:', validateLatitude(-91).isValid); // Should be false
  console.log('Latitude 91:', validateLatitude(91).isValid);   // Should be false
  
  // Test roof area boundaries
  console.log('Roof area 1:', validateRoofArea(1).isValid);     // Should be true
  console.log('Roof area 10000:', validateRoofArea(10000).isValid); // Should be true
  console.log('Roof area 0:', validateRoofArea(0).isValid);     // Should be false
  console.log('Roof area 10001:', validateRoofArea(10001).isValid); // Should be false
  
  // Test efficiency boundaries
  console.log('Efficiency 0.1:', validateCollectionEfficiency(0.1).isValid); // Should be true
  console.log('Efficiency 1.0:', validateCollectionEfficiency(1.0).isValid); // Should be true
  console.log('Efficiency 0.05:', validateCollectionEfficiency(0.05).isValid); // Should be false
  console.log('Efficiency 1.1:', validateCollectionEfficiency(1.1).isValid); // Should be false
}
