const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life and crystal clear hands-free calling.',
    price: 27999,
    category: 'Electronics',
    imageUrl: '/uploads/headphones.webp',
    stock: 25,
  },
  {
    name: 'Apple MacBook Air M2',
    description: 'Supercharged by M2 chip — lightning fast, all-day battery, and a stunning Liquid Retina display.',
    price: 99900,
    category: 'Electronics',
    imageUrl: '/uploads/laptop.jpg',
    stock: 10,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches, N-key rollover, and aluminium frame.',
    price: 5499,
    category: 'Electronics',
    imageUrl: '/uploads/keyboard.webp',
    stock: 30,
  },
  {
    name: 'Wireless Ergonomic Mouse',
    description: 'Silent-click wireless mouse with 3-month battery life and ergonomic thumb rest.',
    price: 2299,
    category: 'Electronics',
    imageUrl: '/uploads/mouse.avif',
    stock: 45,
  },
  {
    name: 'Smartphone 5G Pro',
    description: '6.7" AMOLED display, 108MP camera, 5000mAh battery — stay connected at blazing 5G speeds.',
    price: 34999,
    category: 'Electronics',
    imageUrl: '/uploads/mobile.avif',
    stock: 20,
  },
  {
    name: 'Bluetooth Smart Speaker',
    description: '360° surround sound with deep bass, IPX5 water resistance, and 20-hour playback.',
    price: 3499,
    category: 'Electronics',
    imageUrl: '/uploads/speaker.webp',
    stock: 60,
  },
  {
    name: '20000mAh Power Bank',
    description: 'Dual USB-C fast charging, 65W output, compact and slim design for travel.',
    price: 1899,
    category: 'Electronics',
    imageUrl: '/uploads/powerbank.webp',
    stock: 80,
  },
  {
    name: 'HD Webcam 1080p',
    description: 'Plug-and-play 1080p webcam with auto-focus, built-in noise-cancelling mic. Perfect for WFH.',
    price: 2799,
    category: 'Electronics',
    imageUrl: '/uploads/webcam.png',
    stock: 35,
  },
  {
    name: 'Smart Watch Series X',
    description: 'Health & fitness tracker with ECG, SpO2, GPS, AMOLED display and 7-day battery life.',
    price: 8999,
    category: 'Electronics',
    imageUrl: '/uploads/samrtwatch.jpg',
    stock: 18,
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: 'HDMI 4K, USB 3.0 x3, SD card, PD 100W charging — the ultimate laptop accessory.',
    price: 1599,
    category: 'Electronics',
    imageUrl: '/uploads/usbhub.webp',
    stock: 50,
  },
  {
    name: 'Nike Air Force 1 Sneakers',
    description: 'Classic low-top basketball shoe with a durable leather upper and iconic Air cushioning.',
    price: 7499,
    category: 'Clothing',
    imageUrl: '/uploads/clothing.avif',
    stock: 50,
  },
  {
    name: 'Patagonia Nano Puff Jacket',
    description: 'Lightweight and packable insulated jacket made with recycled materials. Perfect for outdoor adventures.',
    price: 18999,
    category: 'Clothing',
    imageUrl: '/uploads/clothing.avif',
    stock: 18,
  },
  {
    name: "Levi's 511 Slim Jeans",
    description: 'A modern slim fit with just enough stretch for all-day comfort. Sits below the waist.',
    price: 4999,
    category: 'Clothing',
    imageUrl: '/uploads/clothing.avif',
    stock: 40,
  },
  {
    name: 'Atomic Habits — James Clear',
    description: 'The #1 New York Times bestseller on building good habits and breaking bad ones.',
    price: 399,
    category: 'Books',
    imageUrl: '/uploads/books.jpg',
    stock: 100,
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'A guide to programming best practices, from journeyman to master. A must-read for developers.',
    price: 2499,
    category: 'Books',
    imageUrl: '/uploads/books.jpg',
    stock: 60,
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Laser reveals invisible dust. Precisely auto-adapts suction to the task. Up to 60 min runtime.',
    price: 52999,
    category: 'Home',
    imageUrl: '/uploads/home.jpg',
    stock: 12,
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.',
    price: 6499,
    category: 'Home',
    imageUrl: '/uploads/home.jpg',
    stock: 30,
  },
  {
    name: 'Yoga Mat Pro — Non-Slip',
    description: 'Extra thick 6mm mat with alignment lines, eco-friendly TPE material, and carrying strap.',
    price: 1299,
    category: 'Sports',
    imageUrl: '/uploads/sports.jpg',
    stock: 75,
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Replaces 15 sets of weights. Fast dial adjustment system. 5–52.5 lbs per dumbbell.',
    price: 24999,
    category: 'Sports',
    imageUrl: '/uploads/sports.jpg',
    stock: 15,
  },
  {
    name: 'CeraVe Moisturizing Cream',
    description: 'Developed with dermatologists. 3 essential ceramides and hyaluronic acid for all-day hydration.',
    price: 799,
    category: 'Beauty',
    imageUrl: '/uploads/beauty.avif',
    stock: 200,
  },
  {
    name: 'Dyson Airwrap Multi-Styler',
    description: 'Style and dry at once. Uses air to curl, wave, smooth, and volumize for salon-quality results.',
    price: 44999,
    category: 'Beauty',
    imageUrl: '/uploads/beauty.avif',
    stock: 20,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Drop legacy indexes
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log('Dropped legacy index: username_1');
    } catch (err) {
      // Ignore if index doesn't exist
    }

    const placeholderMap = {
      'Electronics': '/uploads/Electronics.jpg',
      'Clothing': '/uploads/clothing.avif',
      'Books': '/uploads/books.jpg',
      'Home': '/uploads/home.jpg',
      'Sports': '/uploads/sports.jpg',
      'Beauty': '/uploads/beauty.avif'
    };

    const userUploadedImages = {
      'Nike Air Force 1 Sneakers': '/uploads/1781189226153-817277600.webp',
      'Patagonia Nano Puff Jacket': '/uploads/1781189242320-700300124.webp',
      "Levi's 511 Slim Jeans": '/uploads/1781189253939-479709041.jpeg',
      'Atomic Habits — James Clear': '/uploads/1781189267439-890224238.jpeg',
      'The Pragmatic Programmer': '/uploads/1781189281587-545516023.jpg',
      'Dyson V15 Detect Vacuum': '/uploads/1781189305854-70102510.jpeg',
      'Instant Pot Duo 7-in-1': '/uploads/1781189323187-593586570.jpg',
      'Yoga Mat Pro — Non-Slip': '/uploads/1781189336855-723588973.jpg',
      'Adjustable Dumbbell Set': '/uploads/1781189349688-499428548.webp',
      'CeraVe Moisturizing Cream': '/uploads/1781189363339-759202363.jpg',
      'Dyson Airwrap Multi-Styler': '/uploads/1781189201254-355931423.jpg'
    };

    const seededProducts = products.map(p => ({
      ...p,
      imageUrl: userUploadedImages[p.name] || placeholderMap[p.category] || '/uploads/Electronics.jpg'
    }));

    // Insert products
    await Product.insertMany(seededProducts);
    console.log(`Seeded ${seededProducts.length} products`);

    // Create admin user
    const admin = new User({
      email: 'admin@shopvault.com',
      fullName: 'Store Admin',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();
    console.log('Created admin user: admin@shopvault.com / admin123');

    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
