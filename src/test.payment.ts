import axios from 'axios'

const BASE_URL = 'http://localhost:4000/api/v1'; 
const TEST_TOKEN = "test-token"; 
const BOOKING_ID = '23ea2a26-d386-4057-8f4d-3bbb0992db43'; 

// Test scenarios
const testScenarios = [
  {
    name: 'Successful Payment',
    testCardType: 'SUCCESSFUL_CARD',
    amount: 5000,
    isInstallment: false
  },
  {
    name: 'Insufficient Funds',
    testCardType: 'INSUFFICIENT_FUNDS',
    amount: 5000,
    isInstallment: false
  },
  {
    name: 'Card with PIN',
    testCardType: 'CARD_WITH_PIN',
    amount: 3000,
    isInstallment: true
  },
  {
    name: 'Invalid Card',
    testCardType: 'INVALID_CARD',
    amount: 2000,
    isInstallment: false
  },
  {
    name: 'Timeout Card',
    testCardType: 'TIMEOUT_CARD',
    amount: 1000,
    isInstallment: false
  }
];

async function testPayment(scenario: { name: any; testCardType: any; amount: any; isInstallment: any; }) {
  try {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log('═'.repeat(50));
    
    const response = await axios.post(
      `${BASE_URL}/payment/${BOOKING_ID}/test-charge`,
      {
        amount: scenario.amount,
        isInstallment: scenario.isInstallment,
        testCardType: scenario.testCardType
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
    // If successful, verify the payment
    if (response.data.data.success) {
      console.log('\n🔍 Verifying payment...');
      const verifyResponse = await axios.get(
        `${BASE_URL}/payment/verify?reference=${response.data.data.reference}`
      );
      console.log('✅ Verification:', JSON.stringify(verifyResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Payment Tests');
  console.log('═'.repeat(50));
  
  for (const scenario of testScenarios) {
    await testPayment(scenario);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
  }
  
  console.log('\n🏁 All tests completed!');
}

// Run tests
runAllTests();

// Export for individual testing
module.exports = {
  testPayment,
  runAllTests,
  testScenarios
};