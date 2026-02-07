require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Vendor = require('./models/Vendor');
const FoodItem = require('./models/FoodItem');

// Sample data
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({ role: 'vendor' });
        await Vendor.deleteMany();
        await FoodItem.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Create vendor users
        const bakeryUser = await User.create({
            name: 'Christ Bakery Manager',
            email: 'bakery@christuniversity.in',
            password: 'vendor123',
            role: 'vendor'
        });

        const freshatariaUser = await User.create({
            name: 'Freshataria Manager',
            email: 'freshataria@christuniversity.in',
            password: 'vendor123',
            role: 'vendor'
        });

        const mingosUser = await User.create({
            name: 'Mingos Manager',
            email: 'mingos@christuniversity.in',
            password: 'vendor123',
            role: 'vendor'
        });

        console.log('✅ Created vendor users');

        // Create vendors
        const christBakery = await Vendor.create({
            vendorId: 'VENDOR001',
            name: 'Christ Bakery',
            userId: bakeryUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 8,
            capacity: 15
        });

        const freshataria = await Vendor.create({
            vendorId: 'VENDOR002',
            name: 'Freshataria',
            userId: freshatariaUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 12,
            capacity: 12
        });

        const mingos = await Vendor.create({
            vendorId: 'VENDOR003',
            name: 'Mingos',
            userId: mingosUser._id,
            isOpen: true,
            currentLoad: 0,
            averagePreparationTime: 15,
            capacity: 10
        });

        console.log('✅ Created 3 vendors');

        // Create food items for Christ Bakery
        const bakeryItems = [
            {
                vendorId: christBakery._id,
                name: 'Chicken Sandwich',
                description: 'Grilled chicken with fresh vegetables',
                price: 80,
                category: 'meals',
                preparationTime: 7,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Veg Puff',
                description: 'Crispy puff with potato filling',
                price: 30,
                category: 'snacks',
                preparationTime: 3,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Chocolate Donut',
                description: 'Fresh chocolate glazed donut',
                price: 40,
                category: 'desserts',
                preparationTime: 2,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: christBakery._id,
                name: 'Cappuccino',
                description: 'Fresh brewed cappuccino',
                price: 50,
                category: 'beverages',
                preparationTime: 4,
                isAvailable: true,
                imageUrl: ''
            }
        ];

        // Create food items for Freshataria
        const freshatariaItems = [
            {
                vendorId: freshataria._id,
                name: 'Caesar Salad',
                description: 'Fresh lettuce with caesar dressing',
                price: 120,
                category: 'meals',
                preparationTime: 10,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Fresh Juice (Orange)',
                description: 'Freshly squeezed orange juice',
                price: 60,
                category: 'beverages',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: freshataria._id,
                name: 'Fruit Bowl',
                description: 'Mixed seasonal fruits',
                price: 80,
                category: 'snacks',
                preparationTime: 8,
                isAvailable: true,
                imageUrl: ''
            }
        ];

        // Create food items for Mingos
        const mingosItems = [
            {
                vendorId: mingos._id,
                name: 'Chicken Burger',
                description: 'Juicy chicken burger with cheese',
                price: 100,
                category: 'meals',
                preparationTime: 12,
                isAvailable: true,
                imageUrl: ''
            },
            {
                vendorId: mingos._id,
                name: 'French Fries',
                description: 'Crispy golden fries',
                price: 50,
                category: 'snacks',
                preparationTime: 8,
                isAvailable: true,
                imageUrl: ''
            },
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
                name: 'Ice Cream Sundae',
                description: 'Vanilla ice cream with chocolate sauce',
                price: 70,
                category: 'desserts',
                preparationTime: 5,
                isAvailable: true,
                imageUrl: ''
            }
        ];

        await FoodItem.insertMany([...bakeryItems, ...freshatariaItems, ...mingosItems]);

        console.log('✅ Created food items for all vendors');
        console.log('\n📊 Summary:');
        console.log(`   - 3 Vendors: Christ Bakery, Freshataria, Mingos`);
        console.log(`   - ${bakeryItems.length} items for Christ Bakery`);
        console.log(`   - ${freshatariaItems.length} items for Freshataria`);
        console.log(`   - ${mingosItems.length} items for Mingos`);
        console.log(`   - Total: ${bakeryItems.length + freshatariaItems.length + mingosItems.length} food items\n`);

        console.log('🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('   Bakery:      bakery@christuniversity.in / vendor123');
        console.log('   Freshataria: freshataria@christuniversity.in / vendor123');
        console.log('   Mingos:      mingos@christuniversity.in / vendor123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
