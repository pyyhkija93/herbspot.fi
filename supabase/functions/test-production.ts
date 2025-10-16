// Test script for production-ready points-add Edge Function
// Run with: deno run --allow-net supabase/functions/test-production.ts

const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const SHOPIFY_SECRET = 'YOUR_SHOPIFY_WEBHOOK_SECRET';

interface TestCase {
  name: string;
  data: any;
  expectedStatus: number;
  description: string;
  skipHmac?: boolean;
}

// HMAC generation utility
async function generateHmac(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

const testCases: TestCase[] = [
  {
    name: 'Basic Shopify Order',
    data: {
      id: 12345,
      email: "customer@herbspot.fi",
      total_price: "29.99",
      currency: "EUR",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 200,
    description: 'Should process Shopify order and add 29 points (29.99 * 1 point per euro)'
  },
  {
    name: 'QR Code Bonus Order',
    data: {
      id: 12346,
      email: "customer@herbspot.fi",
      total_price: "49.99",
      currency: "EUR",
      note_attributes: [
        { name: "qr_code", value: "herbspot://qr/ABC123" }
      ],
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 200,
    description: 'Should process order with QR code and add 49 points'
  },
  {
    name: 'High Value Order',
    data: {
      id: 12347,
      email: "customer@herbspot.fi",
      total_price: "149.99",
      currency: "EUR",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 200,
    description: 'Should process high-value order and add 149 points'
  },
  {
    name: 'Duplicate Order (Idempotency Test)',
    data: {
      id: 12345, // Same as first test
      email: "customer@herbspot.fi",
      total_price: "29.99",
      currency: "EUR",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 200,
    description: 'Should handle duplicate order gracefully (idempotency)'
  },
  {
    name: 'Missing Email',
    data: {
      id: 12348,
      total_price: "25.00",
      currency: "EUR"
    },
    expectedStatus: 400,
    description: 'Should return 400 for missing user identifier'
  },
  {
    name: 'Invalid Amount',
    data: {
      id: 12349,
      email: "customer@herbspot.fi",
      total_price: "invalid",
      currency: "EUR",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 400,
    description: 'Should return 400 for invalid amount'
  },
  {
    name: 'Unsupported Currency',
    data: {
      id: 12350,
      email: "customer@herbspot.fi",
      total_price: "25.00",
      currency: "USD",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 400,
    description: 'Should return 400 for unsupported currency (only EUR allowed)'
  },
  {
    name: 'User ID Instead of Email',
    data: {
      id: 12351,
      user_id: "00000000-0000-0000-0000-000000000000",
      amount: 35.00,
      currency: "EUR"
    },
    expectedStatus: 200,
    description: 'Should process order with user_id instead of email'
  },
  {
    name: 'Small Order',
    data: {
      id: 12352,
      email: "customer@herbspot.fi",
      total_price: "2.99",
      currency: "EUR",
      customer: { email: "customer@herbspot.fi" }
    },
    expectedStatus: 200,
    description: 'Should process small order and add 2 points'
  },
  {
    name: 'Manual Points Addition',
    data: {
      order_id: "MANUAL-001",
      user_id: "00000000-0000-0000-0000-000000000000",
      amount: 10.00,
      currency: "EUR",
      qr_code: "manual_bonus_100"
    },
    expectedStatus: 200,
    description: 'Should add manual bonus points via QR code'
  }
];

async function runTest(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 Description: ${testCase.description}`);
  console.log(`📤 Data:`, JSON.stringify(testCase.data, null, 2));

  try {
    const body = JSON.stringify(testCase.data);
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add HMAC header if not skipping
    if (!testCase.skipHmac) {
      const hmac = await generateHmac(body, SHOPIFY_SECRET);
      headers['X-Shopify-Hmac-Sha256'] = hmac;
      console.log(`🔐 HMAC: ${hmac.substring(0, 20)}...`);
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/points-add`, {
      method: 'POST',
      headers,
      body
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

async function testHmacGeneration() {
  console.log('\n🔐 Testing HMAC Generation...');
  
  const testBody = JSON.stringify({
    id: 99999,
    email: "test@herbspot.fi",
    total_price: "50.00",
    currency: "EUR"
  });
  
  const hmac = await generateHmac(testBody, SHOPIFY_SECRET);
  console.log(`📤 Body: ${testBody}`);
  console.log(`🔐 Generated HMAC: ${hmac}`);
  
  // Test with HMAC test function
  try {
    const hmacResponse = await fetch(`${SUPABASE_URL}/functions/v1/hmac-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: testBody, secret: SHOPIFY_SECRET })
    });
    
    const hmacResult = await hmacResponse.json();
    console.log(`✅ HMAC Test Result:`, hmacResult);
  } catch (error) {
    console.log(`❌ HMAC Test Failed:`, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting HerbSpot Production Points-Add Function Tests');
  console.log('=' .repeat(70));

  let passed = 0;
  let failed = 0;

  // Test HMAC generation first
  await testHmacGeneration();

  // Run all test cases
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

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Function is production ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the function implementation.');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Deploy functions: supabase functions deploy points-add');
  console.log('2. Deploy HMAC test: supabase functions deploy hmac-test');
  console.log('3. Setup Shopify webhooks with proper HMAC secret');
  console.log('4. Test with real Shopify orders');
}

// Performance test
async function performanceTest() {
  console.log('\n🏃‍♂️ Running Performance Test...');
  
  const startTime = Date.now();
  const promises = [];
  
  // Run 10 concurrent requests with HMAC
  for (let i = 0; i < 10; i++) {
    const testData = {
      id: `PERF-${i}`,
      email: 'perf@herbspot.fi',
      total_price: '25.00',
      currency: 'EUR'
    };
    
    const body = JSON.stringify(testData);
    const hmac = await generateHmac(body, SHOPIFY_SECRET);
    
    promises.push(
      fetch(`${SUPABASE_URL}/functions/v1/points-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Hmac-Sha256': hmac
        },
        body
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

// Main execution
async function main() {
  const args = Deno.args;
  
  if (args.includes('--performance')) {
    await performanceTest();
  } else {
    await runAllTests();
    
    if (args.includes('--full')) {
      await performanceTest();
    }
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  await main();
}
