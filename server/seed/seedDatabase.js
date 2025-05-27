import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import models
import User from '../models/User.js';
import Pincode from '../models/Pincode.js';
import Category from '../models/Category.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Sample users
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '9876543210',
    password: 'password123',
    role: 'admin',
    address: {
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      landmark: 'Near City Mall'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Customer',
    lastName: 'One',
    email: 'customer@example.com',
    phone: '9876543211',
    password: 'password123',
    role: 'customer',
    address: {
      street: '456 Customer Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      landmark: 'Near Railway Station'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Pickup',
    lastName: 'Boy',
    email: 'pickup@example.com',
    phone: '9876543212',
    password: 'password123',
    role: 'pickup_boy',
    address: {
      street: '789 Pickup Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@example.com',
    phone: '9876543213',
    password: 'password123',
    role: 'manager',
    address: {
      street: '101 Manager Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400004'
    },
    isEmailVerified: true,
    isActive: true
  }
];

// Sample pincodes
const pincodes = [
  {
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Fort',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '400002',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Colaba',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '400003',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Nariman Point',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '400004',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Girgaon',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '400005',
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Mahalaxmi',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  }
];

// Sample categories
const categories = [
  {
    name: 'Mobile Phones',
    description: 'Smartphones, feature phones and mobile accessories',
    icon: 'smartphone',
    basePrice: 500,
    unit: 'piece',
    subcategories: [
      { name: 'Smartphones', priceModifier: 1.2 },
      { name: 'Feature Phones', priceModifier: 0.8 },
      { name: 'Tablets', priceModifier: 1.5 }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Laptops',
    description: 'Notebooks, laptops and accessories',
    icon: 'laptop',
    basePrice: 1500,
    unit: 'piece',
    subcategories: [
      { name: 'Gaming Laptops', priceModifier: 1.4 },
      { name: 'Business Laptops', priceModifier: 1.2 },
      { name: 'Budget Laptops', priceModifier: 0.9 }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Desktop Computers',
    description: 'Desktop PCs, All-in-Ones and components',
    icon: 'monitor',
    basePrice: 1200,
    unit: 'piece',
    subcategories: [
      { name: 'All-in-One PCs', priceModifier: 1.3 },
      { name: 'Tower PCs', priceModifier: 1.0 },
      { name: 'Mini PCs', priceModifier: 0.8 }
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Computer Accessories',
    description: 'Keyboards, mice, webcams and other accessories',
    icon: 'keyboard',
    basePrice: 200,
    unit: 'piece',
    subcategories: [
      { name: 'Mechanical Keyboards', priceModifier: 1.5 },
      { name: 'Gaming Mice', priceModifier: 1.3 },
      { name: 'Webcams', priceModifier: 1.0 },
      { name: 'Speakers', priceModifier: 1.1 }
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Home Appliances',
    description: 'Small home appliances like toasters, mixers, etc.',
    icon: 'home',
    basePrice: 300,
    unit: 'piece',
    subcategories: [
      { name: 'Kitchen Appliances', priceModifier: 1.1 },
      { name: 'Cleaning Appliances', priceModifier: 1.0 },
      { name: 'Personal Care', priceModifier: 0.9 }
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Printers & Scanners',
    description: 'Printers, scanners and multi-function devices',
    icon: 'printer',
    basePrice: 800,
    unit: 'piece',
    subcategories: [
      { name: 'Laser Printers', priceModifier: 1.2 },
      { name: 'Inkjet Printers', priceModifier: 1.0 },
      { name: 'Scanners', priceModifier: 0.8 },
      { name: 'All-in-One Printers', priceModifier: 1.3 }
    ],
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Batteries',
    description: 'All types of batteries including laptop, mobile, and other electronics',
    icon: 'battery',
    basePrice: 100,
    unit: 'piece',
    subcategories: [
      { name: 'Laptop Batteries', priceModifier: 1.2 },
      { name: 'Mobile Batteries', priceModifier: 0.8 },
      { name: 'Power Banks', priceModifier: 1.5 },
      { name: 'UPS Batteries', priceModifier: 2.0 }
    ],
    isActive: true,
    sortOrder: 7
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Pincode.deleteMany();
    await Category.deleteMany();

    console.log('Data cleared');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async user => {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users created`);

    // Insert pincodes
    const createdPincodes = await Pincode.insertMany(pincodes);
    console.log(`${createdPincodes.length} pincodes created`);

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();