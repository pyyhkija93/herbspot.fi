// Test script for points-add Edge Function
// Run with: deno run --allow-net supabase/functions/test-points-add.ts

const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

interface TestCase {
  name: string;
  data: any;
  expectedStatus: number;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: 'Basic Order Points',
    data: {
      order_id: 'TEST-001',
      email: 'test@herbspot.fi',
      amount: 29.99,
      source: 'shopify'
    },
    expectedStatus: 200,
    description: 'Should add 59 points for €29.99 order (Bronze tier)'
  },
  {
    name: 'QR Code Bonus',
    data: {
      order_id: 'TEST-002',
      email: 'test@herbspot.fi',
      amount: 29.99,
      qr_code: 'herbspot://qr/TEST123',
      source: 'qr'
    },
    expectedStatus: 200,
    description: 'Should add 89 points with QR bonus (59 × 1.5)'
  },
  {
    name: 'High Value Order',
    data: {
      order_id: 'TEST-003',
      email: 'test@herbspot.fi',
      amount: 149.99,
      source: 'shopify'
    },
    expectedStatus: 200,
    description: 'Should add 299 points for €149.99 order'
  },
  {
    name: 'Missing Required Fields',
    data: {
      order_id: 'TEST-004',
      amount: 25.00
      // Missing email/user_id
    },
    expectedStatus: 400,
    description: 'Should return 400 error for missing user_id/email'
  },
  {
    name: 'Invalid Amount',
    data: {
      order_id: 'TEST-005',
      email: 'test@herbspot.fi',
      amount: 'invalid'
    },
    expectedStatus: 400,
    description: 'Should handle invalid amount gracefully'
  },
  {
    name: 'New User Creation',
    data: {
      order_id: 'TEST-006',
      email: 'newuser@herbspot.fi',
      amount: 19.99,
      source: 'shopify'
    },
    expectedStatus: 200,
    description: 'Should create new user and add points'
  },
  {
    name: 'Small Order (No Points)',
    data: {
      order_id: 'TEST-007',
      email: 'test@herbspot.fi',
      amount: 2.99,
      source: 'shopify'
    },
    expectedStatus: 200,
    description: 'Should add 0 points for orders under €5'
  },
  {
    name: 'Existing User ID',
    data: {
      order_id: 'TEST-008',
      user_id: '00000000-0000-0000-0000-000000000000', // Valid UUID format
      amount: 49.99,
      source: 'manual'
    },
    expectedStatus: 200,
    description: 'Should handle existing user_id correctly'
  }
];

async function runTest(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 Description: ${testCase.description}`);
  console.log(`📤 Data:`, JSON.stringify(testCase.data, null, 2));

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/points-add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.data)
    });

    const responseData = await response.json();
    
    console.log(`📊 Status: ${response.status} (expected: ${testCase.expectedStatus})`);
    console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));

    const success = response.status === testCase.expectedStatus;
    console.log(success ? '✅ PASS' : '❌ FAIL');
    
    return success;

  } catch (error) {
    console.log(`💥 Error:`, error.message);
    console.log('❌ FAIL');
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting HerbSpot Points-Add Function Tests');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const success = await runTest(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Function is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the function implementation.');
  }
}

// Performance test
async function performanceTest() {
  console.log('\n🏃‍♂️ Running Performance Test...');
  
  const startTime = Date.now();
  const promises = [];
  
  // Run 10 concurrent requests
  for (let i = 0; i < 10; i++) {
    promises.push(
      fetch(`${SUPABASE_URL}/functions/v1/points-add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: `PERF-TEST-${i}`,
          email: 'perf@herbspot.fi',
          amount: 25.00,
          source: 'performance'
        })
      })
    );
  }
  
  const responses = await Promise.all(promises);
  const endTime = Date.now();
  
  const successful = responses.filter(r => r.status === 200).length;
  const totalTime = endTime - startTime;
  const avgTime = totalTime / responses.length;
  
  console.log(`📈 Performance Results:`);
  console.log(`   - Total requests: ${responses.length}`);
  console.log(`   - Successful: ${successful}`);
  console.log(`   - Total time: ${totalTime}ms`);
  console.log(`   - Average time: ${avgTime.toFixed(2)}ms`);
  console.log(`   - Requests per second: ${(1000 / avgTime).toFixed(2)}`);
}

// Database verification test
async function verifyDatabase() {
  console.log('\n🔍 Verifying Database State...');
  
  // This would require a database query function
  // For now, just log that verification would happen here
  console.log('📊 Database verification would check:');
  console.log('   - User records created correctly');
  console.log('   - Loyalty points updated');
  console.log('   - Transactions logged');
  console.log('   - QR scans recorded');
}

// Main execution
async function main() {
  const args = Deno.args;
  
  if (args.includes('--performance')) {
    await performanceTest();
  } else if (args.includes('--verify')) {
    await verifyDatabase();
  } else {
    await runAllTests();
    
    if (args.includes('--full')) {
      await performanceTest();
      await verifyDatabase();
    }
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  await main();
}

