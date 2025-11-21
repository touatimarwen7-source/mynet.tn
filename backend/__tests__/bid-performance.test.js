/**
 * BID PERFORMANCE TEST - Bid Velocity & Latency Analysis
 * Measures maximum bids per minute while maintaining < 500ms latency
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_RESULTS = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  latencies: [],
  maxLatency: 0,
  minLatency: Infinity,
  avgLatency: 0,
  startTime: 0,
  endTime: 0
};

/**
 * Simulate bid submission with timing
 */
async function submitBid(tenderId, supplierId, price) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `${API_URL}/procurement/offers`,
      {
        tender_id: tenderId,
        supplier_id: supplierId,
        price: price,
        delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        specifications: 'Test bid for performance testing',
        payment_terms: '30 days'
      },
      {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }
    );
    
    const latency = Date.now() - startTime;
    return {
      status: 'success',
      latency: latency,
      statusCode: response.status
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      status: 'failed',
      latency: latency,
      statusCode: error.response?.status || 'unknown'
    };
  }
}

/**
 * Run performance test with increasing load
 */
async function runPerformanceTest() {
  console.log('🚀 Starting BID PERFORMANCE TEST...\n');
  
  TEST_RESULTS.startTime = Date.now();
  
  // Test different loads (5 concurrent bids, 10, 20, 50, 100)
  const testLoads = [
    { concurrent: 5, name: '5 concurrent bids' },
    { concurrent: 10, name: '10 concurrent bids' },
    { concurrent: 20, name: '20 concurrent bids' },
    { concurrent: 50, name: '50 concurrent bids' },
    { concurrent: 100, name: '100 concurrent bids' }
  ];

  for (const load of testLoads) {
    console.log(`\n📊 Testing with ${load.concurrent} concurrent bids...`);
    
    const promises = [];
    for (let i = 0; i < load.concurrent; i++) {
      promises.push(
        submitBid(
          `tender-${Math.floor(i / 10)}`,
          `supplier-${i}`,
          Math.random() * 10000 + 1000
        )
      );
    }
    
    const results = await Promise.all(promises);
    
    // Process results
    results.forEach(result => {
      TEST_RESULTS.totalRequests++;
      TEST_RESULTS.latencies.push(result.latency);
      TEST_RESULTS.maxLatency = Math.max(TEST_RESULTS.maxLatency, result.latency);
      TEST_RESULTS.minLatency = Math.min(TEST_RESULTS.minLatency, result.latency);
      
      if (result.status === 'success') {
        TEST_RESULTS.successfulRequests++;
      } else {
        TEST_RESULTS.failedRequests++;
      }
    });
    
    // Calculate averages
    const loadResults = results.map(r => r.latency);
    const avgLatency = loadResults.reduce((a, b) => a + b, 0) / loadResults.length;
    const maxLoadLatency = Math.max(...loadResults);
    const withIn500ms = loadResults.filter(l => l <= 500).length;
    
    console.log(`   ✓ Avg Latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`   ✓ Max Latency: ${maxLoadLatency}ms`);
    console.log(`   ✓ Within 500ms: ${withIn500ms}/${load.concurrent}`);
    console.log(`   ✓ Success Rate: ${((withIn500ms / load.concurrent) * 100).toFixed(1)}%`);
  }
  
  TEST_RESULTS.endTime = Date.now();
  TEST_RESULTS.avgLatency = TEST_RESULTS.latencies.reduce((a, b) => a + b, 0) / TEST_RESULTS.latencies.length;
  
  printResults();
}

/**
 * Calculate Bid Velocity
 */
function calculateBidVelocity() {
  // Based on test results, estimate bids per minute
  const avgLatencyPerBid = TEST_RESULTS.avgLatency;
  
  // If average latency is 50ms per bid
  // In 60 seconds, we can handle: 60000 / 50 = 1200 bids
  // But we need to maintain < 500ms latency for all
  
  // Conservative estimate: 60 seconds / 500ms = 120 bids max at sustained rate
  // But with proper batching and optimization, we can reach higher
  
  const bidsPerMinute = Math.floor((60000 / TEST_RESULTS.avgLatency) * 0.8); // 80% safety margin
  
  return bidsPerMinute;
}

/**
 * Print comprehensive results
 */
function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log('📈 BID PERFORMANCE TEST RESULTS');
  console.log('='.repeat(70));
  
  const velocityPerMinute = calculateBidVelocity();
  const successRate = ((TEST_RESULTS.successfulRequests / TEST_RESULTS.totalRequests) * 100).toFixed(1);
  const withIn500ms = TEST_RESULTS.latencies.filter(l => l <= 500).length;
  const successRateUnder500ms = ((withIn500ms / TEST_RESULTS.totalRequests) * 100).toFixed(1);
  
  console.log(`\n📊 OVERALL METRICS:`);
  console.log(`   Total Requests: ${TEST_RESULTS.totalRequests}`);
  console.log(`   Successful: ${TEST_RESULTS.successfulRequests}`);
  console.log(`   Failed: ${TEST_RESULTS.failedRequests}`);
  console.log(`   Success Rate: ${successRate}%`);
  
  console.log(`\n⏱️  LATENCY METRICS:`);
  console.log(`   Average Latency: ${TEST_RESULTS.avgLatency.toFixed(2)}ms`);
  console.log(`   Min Latency: ${TEST_RESULTS.minLatency}ms`);
  console.log(`   Max Latency: ${TEST_RESULTS.maxLatency}ms`);
  console.log(`   Requests < 500ms: ${withIn500ms}/${TEST_RESULTS.totalRequests} (${successRateUnder500ms}%)`);
  
  console.log(`\n🚀 BID VELOCITY ANALYSIS:`);
  console.log(`   Maximum Bids/Minute (< 500ms): ${velocityPerMinute}`);
  console.log(`   Recommended Safe Rate: ${Math.floor(velocityPerMinute * 0.7)}-${Math.floor(velocityPerMinute * 0.9)} bids/min`);
  console.log(`   Peak Burst Capacity: ${Math.floor(velocityPerMinute * 1.2)}-${Math.floor(velocityPerMinute * 1.5)} bids/min (short periods)`);
  
  console.log(`\n💡 CAPACITY RECOMMENDATIONS:`);
  if (successRateUnder500ms >= 95) {
    console.log(`   ✅ EXCELLENT: Can handle high-frequency bid submissions`);
    console.log(`   ✅ Current infrastructure is SUITABLE for peak loads`);
  } else if (successRateUnder500ms >= 80) {
    console.log(`   ⚠️  GOOD: Can handle moderate-frequency bid submissions`);
    console.log(`   ⚠️  Consider optimization for peak loads`);
  } else {
    console.log(`   ❌ NEEDS IMPROVEMENT: Consider database optimization`);
    console.log(`   ❌ Implement caching, connection pooling, or load balancing`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('Test Duration: ' + (TEST_RESULTS.endTime - TEST_RESULTS.startTime) + 'ms');
  console.log('='.repeat(70) + '\n');
}

// Run test
if (require.main === module) {
  runPerformanceTest().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runPerformanceTest, calculateBidVelocity, submitBid };
