require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Vendor = require('./models/Vendor');
const FoodItem = require('./models/FoodItem');

// Seed Database with 3 Vendors and their unique food items
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({ role: 'vendor' });
        await Vendor.deleteMany();
        await FoodItem.deleteMany();

        console.log('✅ Cleared existing vendor data\n');

        // ============================================
        // CREATE VENDOR USERS
        // ============================================
        console.log('👤 Creating vendor users...');

        const bakeryUser = await User.create({
            name: 'Christ Bakery Manager',
            email: 'bakery@christuniversity.in',
            password: 'vendor123',
            role: 'vendor',
            vendorId: 'VENDOR001'
        });

        const freshatariaUser = await User.create({
            name: 'Freshataria Manager',
            email: 'freshataria@christuniversity.in',
            password: 'vendor123',
            role: 'vendor',
            vendorId: 'VENDOR002'
        });

        const mingosUser = await User.create({
            name: 'Mingos Manager',
            email: 'mingos@christuniversity.in',
            password: 'vendor123',
            role: 'vendor',
            vendorId: 'VENDOR003'
        });

        console.log('✅ Created 3 vendor users\n');

        // ============================================
        // CREATE VENDORS
        // ============================================
        console.log('🏪 Creating vendors...');

        const christBakery = await Vendor.create({
            vendorId: 'VENDOR001',
            name: 'Christ Bakery',
            userId: bakeryUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 12,  // Matches frontend "12 MIN"
            capacity: 15
        });

        const freshataria = await Vendor.create({
            vendorId: 'VENDOR002',
            name: 'Freshataria',
            userId: freshatariaUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 8,  // Matches frontend "8 MIN"
            capacity: 12
        });

        const mingos = await Vendor.create({
            vendorId: 'VENDOR003',
            name: 'Mingos',
            userId: mingosUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 20,  // Matches frontend "20 MIN"
            capacity: 10
        });

        console.log('✅ Created 3 vendors\n');

        // ============================================
        // CHRIST BAKERY - Artisan Pastries & Coffee
        // ============================================
        console.log('🥖 Adding Christ Bakery menu items...');

        const bakeryItems = await FoodItem.insertMany([
            // Pastries & Baked Goods
            {
                vendorId: christBakery._id,
                name: 'Croissant',
                description: 'Buttery, flaky French croissant',
                price: 60,
                category: 'snacks',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a'
            },
            {
                vendorId: christBakery._id,
                name: 'Chocolate Donut',
                description: 'Fresh chocolate glazed donut',
                price: 40,
                category: 'desserts',
                preparationTime: 3,
                isAvailable: true,
                imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307'
            },
            {
                vendorId: christBakery._id,
                name: 'Blueberry Muffin',
                description: 'Homemade blueberry muffin',
                price: 50,
                category: 'desserts',
                preparationTime: 3,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Veg Puff',
                description: 'Crispy puff pastry with spiced potato filling',
                price: 30,
                category: 'snacks',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            // Sandwiches
            {
                vendorId: christBakery._id,
                name: 'Chicken Sandwich',
                description: 'Grilled chicken with fresh vegetables and mayo',
                price: 85,
                category: 'meals',
                preparationTime: 10,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Veg Sandwich',
                description: 'Fresh vegetables with cheese and sauces',
                price: 70,
                category: 'meals',
                preparationTime: 8,
                isAvailable: true,
                imageUrl: ''
            },
            // Coffee & Beverages
            {
                vendorId: christBakery._id,
                name: 'Cappuccino',
                description: 'Classic Italian cappuccino',
                price: 60,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Cold Coffee',
                description: 'Chilled coffee with ice cream',
                price: 80,
                category: 'beverages',
                preparationTime: 6,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Latte',
                description: 'Smooth espresso with steamed milk',
                price: 70,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Hot Chocolate',
                description: 'Rich hot chocolate with whipped cream',
                price: 75,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            }
        ]);

        console.log(`✅ Added ${bakeryItems.length} items to Christ Bakery\n`);

        // ============================================
        // FRESHATARIA - Clean Eating Reimagined
        // ============================================
        console.log('🥗 Adding Freshataria menu items...');

        const freshatariaItems = await FoodItem.insertMany([
            // Salads
            {
                vendorId: freshataria._id,
                name: 'Caesar Salad',
                description: 'Crispy romaine lettuce with caesar dressing and parmesan',
                price: 140,
                category: 'meals',
                preparationTime: 8,
                isAvailable: true,
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
            },
            {
                vendorId: freshataria._id,
                name: 'Greek Salad',
                description: 'Fresh vegetables with feta cheese and olives',
                price: 130,
                category: 'meals',
                preparationTime: 8,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Chicken Protein Bowl',
                description: 'Grilled chicken with quinoa, avocado, and greens',
                price: 180,
                category: 'meals',
                preparationTime: 12,
                isAvailable: true,
                imageUrl: ''
            },
            // Fresh Juices
            {
                vendorId: freshataria._id,
                name: 'Orange Juice',
                description: 'Freshly squeezed orange juice',
                price: 60,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Watermelon Juice',
                description: 'Fresh watermelon juice',
                price: 50,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Green Smoothie',
                description: 'Spinach, banana, and mango blend',
                price: 90,
                category: 'beverages',
                preparationTime: 6,
                isAvailable: true,
                imageUrl: ''
            },
            // Healthy Snacks
            {
                vendorId: freshataria._id,
                name: 'Fruit Bowl',
                description: 'Seasonal mixed fruits with honey',
                price: 80,
                category: 'snacks',
                preparationTime: 6,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Granola Yogurt',
                description: 'Greek yogurt with granola and berries',
                price: 100,
                category: 'snacks',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            // Wraps
            {
                vendorId: freshataria._id,
                name: 'Falafel Wrap',
                description: 'Crispy falafel with hummus and veggies',
                price: 110,
                category: 'meals',
                preparationTime: 10,
                isAvailable: true,
                imageUrl: ''
            }
        ]);

        console.log(`✅ Added ${freshatariaItems.length} items to Freshataria\n`);

        // ============================================
        // MINGOS - The Taste of Asia
        // ============================================
        console.log('🍜 Adding Mingos menu items...');

        const mingosItems = await FoodItem.insertMany([
            // Asian Meals
            {
                vendorId: mingos._id,
                name: 'Chicken Biryani',
                description: 'Aromatic basmati rice with spiced chicken',
                price: 150,
                category: 'meals',
                preparationTime: 20,
                isAvailable: true,
                imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8'
            },
            {
                vendorId: mingos._id,
                name: 'Veg Biryani',
                description: 'Fragrant rice with mixed vegetables and spices',
                price: 120,
                category: 'meals',
                preparationTime: 18,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Chicken Fried Rice',
                description: 'Wok-tossed rice with chicken and vegetables',
                price: 130,
                category: 'meals',
                preparationTime: 15,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Hakka Noodles',
                description: 'Stir-fried noodles with vegetables and sauces',
                price: 110,
                category: 'meals',
                preparationTime: 15,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Schezwan Fried Rice',
                description: 'Spicy fried rice with Schezwan sauce',
                price: 140,
                category: 'meals',
                preparationTime: 15,
                isAvailable: true,
                imageUrl: ''
            },
            // South Indian
            {
                vendorId: mingos._id,
                name: 'Masala Dosa',
                description: 'Crispy rice crepe with spiced potato filling',
                price: 90,
                category: 'meals',
                preparationTime: 12,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Uttapam',
                description: 'Thick pancake topped with vegetables',
                price: 80,
                category: 'meals',
                preparationTime: 12,
                isAvailable: true,
                imageUrl: ''
            },
            // Snacks
            {
                vendorId: mingos._id,
                name: 'Spring Rolls',
                description: 'Crispy vegetable spring rolls with sweet chili sauce',
                price: 70,
                category: 'snacks',
                preparationTime: 10,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Veg Manchurian',
                description: 'Deep-fried vegetable balls in tangy sauce',
                price: 90,
                category: 'snacks',
                preparationTime: 12,
                isAvailable: true,
                imageUrl: ''
            },
            // Beverages
            {
                vendorId: mingos._id,
                name: 'Coke',
                description: 'Chilled Coca-Cola',
                price: 40,
                category: 'beverages',
                preparationTime: 2,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Masala Chai',
                description: 'Traditional Indian spiced tea',
                price: 30,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'Mango Lassi',
                description: 'Sweet mango yogurt drink',
                price: 60,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            }
        ]);

        console.log(`✅ Added ${mingosItems.length} items to Mingos\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📊 SUMMARY:');
        console.log(`   ├─ 3 Vendors Created`);
        console.log(`   │  ├─ Christ Bakery (${bakeryItems.length} items) - Artisan Pastries & Coffee`);
        console.log(`   │  ├─ Freshataria (${freshatariaItems.length} items) - Clean Eating Reimagined`);
        console.log(`   │  └─ Mingos (${mingosItems.length} items) - The Taste of Asia`);
        console.log(`   └─ Total Food Items: ${bakeryItems.length + freshatariaItems.length + mingosItems.length}`);

        console.log('\n📝 VENDOR LOGIN CREDENTIALS:');
        console.log('   ┌─────────────────────────────────────────────────┐');
        console.log('   │ Christ Bakery:                                  │');
        console.log('   │   Email: bakery@christuniversity.in             │');
        console.log('   │   Password: vendor123                           │');
        console.log('   ├─────────────────────────────────────────────────┤');
        console.log('   │ Freshataria:                                    │');
        console.log('   │   Email: freshataria@christuniversity.in        │');
        console.log('   │   Password: vendor123                           │');
        console.log('   ├─────────────────────────────────────────────────┤');
        console.log('   │ Mingos:                                         │');
        console.log('   │   Email: mingos@christuniversity.in             │');
        console.log('   │   Password: vendor123                           │');
        console.log('   └─────────────────────────────────────────────────┘');

        console.log('\n🚀 NEXT STEPS:');
        console.log('   1. Start backend: npm run dev');
        console.log('   2. Test endpoints in Postman');
        console.log('   3. Frontend can now fetch vendors and food items!');
        console.log('\n' + '='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR SEEDING DATABASE:', error);
        process.exit(1);
    }
};

seedData();
