// debug/testOrderAPI.js
// Test the order creation API endpoint

import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Configure axios to handle cookies
axios.defaults.withCredentials = true;

const testOrderAPI = async () => {
  try {
    console.log('🧪 Testing Order API...');

    // Step 1: Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'customer@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    console.log(`✅ Logged in as: ${loginResponse.data.data.firstName} ${loginResponse.data.data.lastName}`);

    // Step 2: Get categories
    console.log('📱 Fetching categories...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    
    if (!categoriesResponse.data.success || categoriesResponse.data.data.length === 0) {
      throw new Error('No categories found');
    }

    const mobileCategory = categoriesResponse.data.data.find(cat => cat.name === 'Mobile Phones');
    console.log(`✅ Found category: ${mobileCategory.name} (₹${mobileCategory.basePrice})`);

    // Step 3: Create order
    console.log('📦 Creating order...');
    const orderData = {
      items: [{
        categoryId: mobileCategory._id,
        subcategory: 'Smartphones',
        brand: 'Samsung',
        model: 'Galaxy S21',
        condition: 'good',
        quantity: 1,
        description: 'Test phone for API'
      }],
      pickupDetails: {
        address: {
          street: '123 API Test Street',
          city: 'Rajahmundry',
          state: 'Andhra Pradesh',
          pincode: '533101',
          landmark: 'Near API Test Landmark'
        },
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeSlot: 'morning',
        contactNumber: '9876543210',
        specialInstructions: 'API test order'
      },
      pricing: {
        estimatedTotal: 600,
        pickupCharges: 0
      }
    };

    const orderResponse = await axios.post(`${API_URL}/api/orders`, orderData);

    if (!orderResponse.data.success) {
      throw new Error('Order creation failed');
    }

    const order = orderResponse.data.data;
    console.log('✅ Order created successfully!');
    console.log(`📦 Order Number: ${order.orderNumber}`);
    console.log(`🔐 PIN: ${order.pinVerification?.pin}`);
    console.log(`💰 Total: ₹${order.pricing.estimatedTotal}`);
    console.log(`📅 Status: ${order.status}`);

    // Step 4: Fetch user orders
    console.log('📋 Fetching user orders...');
    const userOrdersResponse = await axios.get(`${API_URL}/api/orders`);
    
    console.log(`✅ Found ${userOrdersResponse.data.count} orders for user`);

    console.log('\n🎉 Order API test PASSED!');

  } catch (error) {
    console.error('❌ Order API test FAILED:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.error || error.response.data?.message || 'Unknown error'}`);
      if (error.response.data?.errors) {
        console.error('   Validation errors:', error.response.data.errors);
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
};

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOrderAPI();
}

export default testOrderAPI;