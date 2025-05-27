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
      street: 'Admin Office, Danavaipeta',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      pincode: '533103',
      landmark: 'Near Collectorate'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'customer@example.com',
    phone: '9876543211',
    password: 'password123',
    role: 'customer',
    address: {
      street: '15-2-34, T.Nagar',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      pincode: '533101',
      landmark: 'Near Godavari Bridge'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Suresh',
    lastName: 'Babu',
    email: 'pickup@example.com',
    phone: '9876543212',
    password: 'password123',
    role: 'pickup_boy',
    address: {
      street: '8-1-67, Rangampeta',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      pincode: '533104'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Manager',
    lastName: 'Singh',
    email: 'manager@example.com',
    phone: '9876543213',
    password: 'password123',
    role: 'manager',
    address: {
      street: '12-4-56, Morampudi',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      pincode: '533102'
    },
    isEmailVerified: true,
    isActive: true
  },
  {
    firstName: 'Lakshmi',
    lastName: 'Devi',
    email: 'customer2@example.com',
    phone: '9876543214',
    password: 'password123',
    role: 'customer',
    address: {
      street: '45-2-12, Syamala Nagar',
      city: 'Kakinada',
      state: 'Andhra Pradesh',
      pincode: '533001',
      landmark: 'Near Port'
    },
    isEmailVerified: true,
    isActive: true
  }
];

// Andhra Pradesh pincodes - Rajahmundry and surrounding areas
const pincodes = [
  // Rajahmundry City
  {
    pincode: '533101',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533102',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Morampudi',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533103',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Danavaipeta',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533104',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Rangampeta',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533105',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Rajahmundry Rural',
    isServiceable: true,
    pickupCharges: 50,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Kakinada
  {
    pincode: '533001',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533002',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    area: 'Port Area',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533003',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    area: 'Suryaraopeta',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  {
    pincode: '533004',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    area: 'Vakalapudi',
    isServiceable: true,
    pickupCharges: 0,
    minimumOrderValue: 100,
    estimatedPickupTime: '24-48 hours'
  },
  
  // Amalapuram
  {
    pincode: '533201',
    city: 'Amalapuram',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 30,
    minimumOrderValue: 150,
    estimatedPickupTime: '48-72 hours'
  },
  {
    pincode: '533202',
    city: 'Amalapuram',
    state: 'Andhra Pradesh',
    area: 'Amalapuram Rural',
    isServiceable: true,
    pickupCharges: 50,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Pithapuram
  {
    pincode: '533450',
    city: 'Pithapuram',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 40,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Ramachandrapuram
  {
    pincode: '533255',
    city: 'Ramachandrapuram',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 40,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Samalkota
  {
    pincode: '533440',
    city: 'Samalkota',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 30,
    minimumOrderValue: 150,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Mandapeta
  {
    pincode: '533308',
    city: 'Mandapeta',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 40,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Tuni
  {
    pincode: '533401',
    city: 'Tuni',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 50,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Razole
  {
    pincode: '533242',
    city: 'Razole',
    state: 'Andhra Pradesh',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 60,
    minimumOrderValue: 250,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Yanam (Puducherry UT in AP)
  {
    pincode: '533464',
    city: 'Yanam',
    state: 'Puducherry',
    area: 'Main Town',
    isServiceable: true,
    pickupCharges: 50,
    minimumOrderValue: 200,
    estimatedPickupTime: '48-72 hours'
  },
  
  // Surrounding rural areas
  {
    pincode: '533128',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    area: 'Kovvur',
    isServiceable: true,
    pickupCharges: 60,
    minimumOrderValue: 300,
    estimatedPickupTime: '72 hours'
  }
];

// Comprehensive E-waste categories with realistic Indian market prices
const categories = [
  {
    name: 'Mobile Phones',
    description: 'Smartphones, feature phones, and mobile accessories',
    icon: 'smartphone',
    basePrice: 800,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,   // Working perfectly
      good: 0.75,       // Minor scratches/issues
      fair: 0.5,        // Functional but damaged
      poor: 0.3,        // Not working well
      broken: 0.15      // Completely broken
    },
    subcategories: [
      { name: 'Premium Smartphones (iPhone, Samsung Galaxy)', priceModifier: 1.8 },
      { name: 'Mid-range Smartphones', priceModifier: 1.2 },
      { name: 'Budget Smartphones', priceModifier: 1.0 },
      { name: 'Feature Phones', priceModifier: 0.3 },
      { name: 'Tablets (iPad, Android)', priceModifier: 1.5 }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Laptops & Notebooks',
    description: 'All types of laptops, notebooks and netbooks',
    icon: 'laptop',
    basePrice: 2500,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.4,
      broken: 0.2
    },
    subcategories: [
      { name: 'Gaming Laptops (High-end)', priceModifier: 1.8 },
      { name: 'Business Laptops (ThinkPad, Dell)', priceModifier: 1.4 },
      { name: 'MacBooks', priceModifier: 2.0 },
      { name: 'Regular Laptops', priceModifier: 1.0 },
      { name: 'Netbooks/Chromebooks', priceModifier: 0.6 }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Desktop Computers',
    description: 'Desktop PCs, All-in-Ones, and computer components',
    icon: 'monitor',
    basePrice: 1800,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.4,
      broken: 0.2
    },
    subcategories: [
      { name: 'All-in-One PCs (iMac, HP)', priceModifier: 1.5 },
      { name: 'Gaming Desktop PCs', priceModifier: 1.6 },
      { name: 'Office Desktop PCs', priceModifier: 1.0 },
      { name: 'Mini PCs/NUCs', priceModifier: 0.8 },
      { name: 'Workstations', priceModifier: 1.8 }
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Computer Accessories',
    description: 'Keyboards, mice, webcams, speakers and other peripherals',
    icon: 'keyboard',
    basePrice: 150,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.1
    },
    subcategories: [
      { name: 'Mechanical Keyboards', priceModifier: 2.0 },
      { name: 'Gaming Mice & Keyboards', priceModifier: 1.5 },
      { name: 'Webcams (HD/4K)', priceModifier: 1.2 },
      { name: 'Computer Speakers', priceModifier: 1.0 },
      { name: 'Headphones/Headsets', priceModifier: 1.3 },
      { name: 'External Hard Drives', priceModifier: 1.8 }
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Televisions',
    description: 'CRT TVs, LED/LCD TVs, Smart TVs of all sizes',
    icon: 'monitor',
    basePrice: 1200,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.15
    },
    subcategories: [
      { name: 'Smart TVs (55" and above)', priceModifier: 2.5 },
      { name: 'Smart TVs (32"-50")', priceModifier: 1.8 },
      { name: 'LED/LCD TVs (Large)', priceModifier: 1.5 },
      { name: 'LED/LCD TVs (Medium)', priceModifier: 1.0 },
      { name: 'CRT TVs (Old)', priceModifier: 0.3 }
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Home Appliances',
    description: 'Small home appliances like microwaves, mixers, irons, etc.',
    icon: 'home',
    basePrice: 400,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.15
    },
    subcategories: [
      { name: 'Microwave Ovens', priceModifier: 1.5 },
      { name: 'Mixer Grinders', priceModifier: 1.0 },
      { name: 'Electric Kettles', priceModifier: 0.6 },
      { name: 'Irons/Steamers', priceModifier: 0.8 },
      { name: 'Vacuum Cleaners', priceModifier: 1.3 },
      { name: 'Food Processors', priceModifier: 1.2 }
    ],
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Printers & Scanners',
    description: 'All types of printers, scanners and multi-function devices',
    icon: 'printer',
    basePrice: 600,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.15
    },
    subcategories: [
      { name: 'Laser Printers (Office)', priceModifier: 1.5 },
      { name: 'Inkjet Printers', priceModifier: 1.0 },
      { name: 'All-in-One Printers', priceModifier: 1.3 },
      { name: 'Dot Matrix Printers', priceModifier: 0.8 },
      { name: 'Large Format Printers', priceModifier: 2.0 },
      { name: 'Scanners', priceModifier: 0.8 }
    ],
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Batteries & Power',
    description: 'All types of batteries including laptop, mobile, UPS and inverter batteries',
    icon: 'battery',
    basePrice: 200,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.7,
      fair: 0.5,
      poor: 0.3,
      broken: 0.2
    },
    subcategories: [
      { name: 'Laptop Batteries', priceModifier: 1.5 },
      { name: 'Mobile Phone Batteries', priceModifier: 0.8 },
      { name: 'Power Banks', priceModifier: 1.2 },
      { name: 'UPS Batteries', priceModifier: 2.5 },
      { name: 'Inverter Batteries', priceModifier: 3.0 },
      { name: 'Car Batteries', priceModifier: 4.0 }
    ],
    isActive: true,
    sortOrder: 8
  },
  {
    name: 'Audio & Video Equipment',
    description: 'Music systems, DVD players, cameras and audio equipment',
    icon: 'volume-2',
    basePrice: 500,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.15
    },
    subcategories: [
      { name: 'Digital Cameras (DSLR)', priceModifier: 2.0 },
      { name: 'Digital Cameras (Point & Shoot)', priceModifier: 1.2 },
      { name: 'Music Systems/Speakers', priceModifier: 1.3 },
      { name: 'DVD/Blu-ray Players', priceModifier: 0.8 },
      { name: 'Gaming Consoles', priceModifier: 1.8 },
      { name: 'Amplifiers/Receivers', priceModifier: 1.5 }
    ],
    isActive: true,
    sortOrder: 9
  },
  {
    name: 'Kitchen Appliances',
    description: 'Refrigerators, washing machines and large kitchen appliances',
    icon: 'chef-hat',
    basePrice: 2000,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.2
    },
    subcategories: [
      { name: 'Refrigerators (Double Door)', priceModifier: 2.0 },
      { name: 'Refrigerators (Single Door)', priceModifier: 1.5 },
      { name: 'Washing Machines (Front Load)', priceModifier: 2.2 },
      { name: 'Washing Machines (Top Load)', priceModifier: 1.8 },
      { name: 'Air Conditioners', priceModifier: 2.5 },
      { name: 'Water Purifiers', priceModifier: 1.0 }
    ],
    isActive: true,
    sortOrder: 10
  },
  {
    name: 'Computer Components',
    description: 'Motherboards, RAM, hard drives, graphics cards and other PC parts',
    icon: 'cpu',
    basePrice: 300,
    unit: 'piece',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.3,
      broken: 0.1
    },
    subcategories: [
      { name: 'Graphics Cards (High-end)', priceModifier: 3.0 },
      { name: 'Graphics Cards (Mid-range)', priceModifier: 2.0 },
      { name: 'Processors (CPU)', priceModifier: 2.5 },
      { name: 'RAM Memory', priceModifier: 1.5 },
      { name: 'Hard Drives/SSDs', priceModifier: 1.8 },
      { name: 'Motherboards', priceModifier: 2.0 },
      { name: 'Power Supplies', priceModifier: 1.2 }
    ],
    isActive: true,
    sortOrder: 11
  },
  {
    name: 'Cables & Connectors',
    description: 'All types of cables, chargers and electronic connectors',
    icon: 'cable',
    basePrice: 50,
    unit: 'kg',
    conditionMultipliers: {
      excellent: 1.0,
      good: 0.9,
      fair: 0.8,
      poor: 0.6,
      broken: 0.4
    },
    subcategories: [
      { name: 'Mobile Chargers', priceModifier: 1.5 },
      { name: 'Laptop Chargers', priceModifier: 2.0 },
      { name: 'HDMI/USB Cables', priceModifier: 1.2 },
      { name: 'Power Cables', priceModifier: 1.0 },
      { name: 'Network Cables', priceModifier: 0.8 },
      { name: 'Audio/Video Cables', priceModifier: 1.1 }
    ],
    isActive: true,
    sortOrder: 12
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

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('\nTest Accounts Created:');
    console.log('📧 Admin: admin@example.com | 🔑 password123');
    console.log('📧 Customer: customer@example.com | 🔑 password123');
    console.log('📧 Pickup Boy: pickup@example.com | 🔑 password123');
    console.log('📧 Manager: manager@example.com | 🔑 password123');
    console.log('📧 Customer 2: customer2@example.com | 🔑 password123');
    
    console.log('\nService Areas Added:');
    console.log('🏙️  Rajahmundry (Main areas): 533101-533105');
    console.log('🏙️  Kakinada: 533001-533004');
    console.log('🏙️  Amalapuram: 533201-533202');
    console.log('🏙️  Other areas: Pithapuram, Samalkota, Tuni, Razole, etc.');
    
    console.log('\nE-waste Categories Added:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - Base Price: ₹${cat.basePrice}/${cat.unit}`);
    });
    
    console.log('\n🚀 Ready to start! Run: npm run dev:full');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();