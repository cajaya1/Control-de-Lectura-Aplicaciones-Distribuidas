const { Product } = require('../models/Product');

async function seedDatabase() {
    try {
        console.log('Seeding database with initial products...');

        const products = [
            {
                productId: 'P-001',
                name: 'Laptop Dell XPS 15',
                availableStock: 25,
                reservedStock: 0
            },
            {
                productId: 'P-002',
                name: 'Mouse Logitech MX Master',
                availableStock: 50,
                reservedStock: 0
            },
            {
                productId: 'P-003',
                name: 'Keyboard Mechanical RGB',
                availableStock: 30,
                reservedStock: 0
            },
            {
                productId: 'P-004',
                name: 'Monitor LG 27" 4K',
                availableStock: 15,
                reservedStock: 0
            },
            {
                productId: 'P-005',
                name: 'Webcam Logitech C920',
                availableStock: 40,
                reservedStock: 0
            }
        ];

        for (const product of products) {
            await Product.upsert(product);
        }

        console.log('Database seeded successfully with', products.length, 'products');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

module.exports = { seedDatabase };
