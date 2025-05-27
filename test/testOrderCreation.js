// test/testOrderCreation.js
// Quick test script to verify order creation works

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../server/models/Order.js';
import Category from '../server/models/Category.js';
import User from '../server/models/User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for testing'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const testOrderCreation = async () => {
  try {
    console.log('🧪 Testing Order Creation...');

    // Find a customer and category for testing
    const customer = await User.findOne({ role: 'customer' });
    const category = await Category.findOne({ name: 'Mobile Phones' });

    if (!customer) {
      console.error('❌ No customer found. Run: npm run seed');
      process.exit(1);
    }

    if (!category) {
      console.error('❌ No categories found. Run: npm run seed');
      process.exit(1);
    }

    console.log(`✅ Found customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`✅ Found category: ${category.name} (₹${category.basePrice})`);

    // Create test order data
    const orderData = {
      customerId: customer._id,
      items: [{
        categoryId: category._id,
        subcategory: 'Smartphones',
        brand: 'Samsung',
        model: 'Galaxy S21',
        condition: 'good',
        quantity: 1,
        estimatedPrice: 600,
        description: 'Test phone for order creation'
      }],
      pickupDetails: {
        address: {
          street: '123 Test Street',
          city: 'Rajahmundry',
          state: 'Andhra Pradesh',
          pincode: '533101',
          landmark: 'Near Test Landmark'
        },
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        timeSlot: 'morning',
        contactNumber: '9876543210',
        specialInstructions: 'Test order creation'
      },
      pricing: {
        estimatedTotal: 600,
        pickupCharges: 0,
        finalAmount: 600
      }
    };

    // Create the order
    console.log('🔄 Creating order...');
    const order = await Order.create(orderData);

    console.log('✅ Order created successfully!');
    console.log(`📦 Order Number: ${order.orderNumber}`);
    console.log(`🔐 PIN: ${order.pinVerification.pin}`);
    console.log(`💰 Total: ₹${order.pricing.estimatedTotal}`);
    console.log(`📅 Status: ${order.status}`);
    console.log(`🕒 Created: ${order.createdAt}`);

    // Verify the order was saved correctly
    const savedOrder = await Order.findById(order._id)
      .populate('items.categoryId', 'name')
      .populate('customerId', 'firstName lastName');

    console.log('\n📋 Order Details:');
    console.log(`   Customer: ${savedOrder.customerId.firstName} ${savedOrder.customerId.lastName}`);
    console.log(`   Items: ${savedOrder.items.length}`);
    console.log(`   Category: ${savedOrder.items[0].categoryId.name}`);
    console.log(`   Timeline entries: ${savedOrder.timeline.length}`);

    console.log('\n🎉 Order creation test PASSED!');

  } catch (error) {
    console.error('❌ Order creation test FAILED:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    mongoose.connection.close();
  }
};

testOrderCreation();