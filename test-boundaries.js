#!/usr/bin/env node

// RTRWH System Boundary Testing Script
// Tests all input boundaries and validates system responses

const API_BASE = 'http://localhost:4000';

// Test cases with expected results
const testCases = [
  // Valid cases
  {
    name: 'Valid Delhi coordinates',
    url: '/context?lat=28.6139&lon=77.209',
    expectedStatus: 200,
    expectedFields: ['rainfall_mm_year', 'groundwater_depth_m', 'aquifer']
  },
  {
    name: 'Valid Mumbai coordinates',
    url: '/context?lat=19.0760&lon=72.8777',
    expectedStatus: 200,
    expectedFields: ['rainfall_mm_year', 'groundwater_depth_m', 'aquifer']
  },
  
  // Invalid latitude cases
  {
    name: 'Invalid latitude - too high',
    url: '/context?lat=91&lon=77.209',
    expectedStatus: 200,
    expectedError: 'Latitude must be between -90 and 90 degrees'
  },
  {
    name: 'Invalid latitude - too low',
    url: '/context?lat=-91&lon=77.209',
    expectedStatus: 200,
    expectedError: 'Latitude must be between -90 and 90 degrees'
  },
  
  // Invalid longitude cases
  {
    name: 'Invalid longitude - too high',
    url: '/context?lat=28.6139&lon=181',
    expectedStatus: 200,
    expectedError: 'Longitude must be between -180 and 180 degrees'
  },
  {
    name: 'Invalid longitude - too low',
    url: '/context?lat=28.6139&lon=-181',
    expectedStatus: 200,
    expectedError: 'Longitude must be between -180 and 180 degrees'
  },
  
  // Assessment test cases
  {
    name: 'Valid assessment',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 200,
    expectedFields: ['feasibility', 'suggested_structures', 'volumes', 'cost_estimate_inr']
  },
  
  // Invalid roof area cases
  {
    name: 'Invalid roof area - zero',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 0,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 400,
    expectedError: 'Number must be greater than or equal to 1'
  },
  {
    name: 'Invalid roof area - too large',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 10001,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 400,
    expectedError: 'Number must be less than or equal to 10000'
  },
  
  // Invalid efficiency cases
  {
    name: 'Invalid efficiency - too low',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.05
    },
    expectedStatus: 400,
    expectedError: 'Number must be greater than or equal to 0.1'
  },
  {
    name: 'Invalid efficiency - too high',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 1.5
    },
    expectedStatus: 400,
    expectedError: 'Number must be less than or equal to 1'
  },
  
  // Invalid roof type
  {
    name: 'Invalid roof type',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'invalid',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 400,
    expectedError: 'Invalid input'
  },
  
  // Boundary values
  {
    name: 'Minimum valid roof area',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 1,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 200,
    expectedFields: ['feasibility', 'suggested_structures']
  },
  {
    name: 'Maximum valid roof area',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 10000,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.9
    },
    expectedStatus: 200,
    expectedFields: ['feasibility', 'suggested_structures']
  },
  {
    name: 'Minimum valid efficiency',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 0.1
    },
    expectedStatus: 200,
    expectedFields: ['feasibility', 'suggested_structures']
  },
  {
    name: 'Maximum valid efficiency',
    method: 'POST',
    url: '/assess',
    body: {
      location: { lat: 28.6139, lon: 77.209 },
      roof_area_m2: 120,
      roof_type: 'concrete',
      open_space_m2: 20,
      collection_efficiency: 1.0
    },
    expectedStatus: 200,
    expectedFields: ['feasibility', 'suggested_structures']
  }
];

// Test execution function
async function runTests() {
  console.log('🧪 Starting RTRWH System Boundary Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const options = {
        method: testCase.method || 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (testCase.body) {
        options.body = JSON.stringify(testCase.body);
      }
      
      const response = await fetch(`${API_BASE}${testCase.url}`, options);
      const data = await response.json();
      
      // Check status code
      if (response.status !== testCase.expectedStatus) {
        console.log(`❌ FAILED: Expected status ${testCase.expectedStatus}, got ${response.status}`);
        failed++;
        continue;
      }
      
      // Check for expected error
      if (testCase.expectedError) {
        if ((data.error && data.error.includes(testCase.expectedError)) || 
            (data.details && data.details.includes(testCase.expectedError))) {
          console.log(`✅ PASSED: Correct error message`);
          passed++;
        } else {
          console.log(`❌ FAILED: Expected error "${testCase.expectedError}", got error: "${data.error}", details: "${data.details}"`);
          failed++;
        }
        continue;
      }
      
      // Check for expected fields
      if (testCase.expectedFields) {
        const missingFields = testCase.expectedFields.filter(field => !(field in data));
        if (missingFields.length === 0) {
          console.log(`✅ PASSED: All expected fields present`);
          passed++;
        } else {
          console.log(`❌ FAILED: Missing fields: ${missingFields.join(', ')}`);
          failed++;
        }
        continue;
      }
      
      // If no specific checks, just check if response is valid
      if (data && !data.error) {
        console.log(`✅ PASSED: Valid response`);
        passed++;
      } else {
        console.log(`❌ FAILED: Invalid response`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is working correctly with proper boundaries.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the system implementation.');
  }
}

// Run the tests
runTests().catch(console.error);
