require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models/Product');
const inventoryRoutes = require('./routes/inventoryRoutes');
const rabbitmqConsumer = require('./messaging/rabbitmqConsumer');
const { seedDatabase } = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1', inventoryRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'inventory-service' });
});

// Función para iniciar el servicio
async function startService() {
    try {
        // Conectar a la base de datos
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        // Sincronizar modelos con la base de datos
        await sequelize.sync({ force: true }); // force: true recrea las tablas
        console.log('Database synchronized');

        // Sembrar datos iniciales
        await seedDatabase();

        // Conectar a RabbitMQ con reintentos
        let connected = false;
        let retries = 0;
        const maxRetries = 10;

        while (!connected && retries < maxRetries) {
            try {
                await rabbitmqConsumer.connect();
                await rabbitmqConsumer.startConsuming();
                connected = true;
                console.log('RabbitMQ consumer started successfully');
            } catch (error) {
                retries++;
                console.log(`Failed to connect to RabbitMQ (attempt ${retries}/${maxRetries}). Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!connected) {
            console.error('Could not connect to RabbitMQ after maximum retries');
            process.exit(1);
        }

        // Iniciar servidor HTTP
        app.listen(PORT, () => {
            console.log(`Inventory Service running on port ${PORT}`);
            console.log(`Health check available at http://localhost:${PORT}/health`);
        });

    } catch (error) {
        console.error('Error starting service:', error);
        process.exit(1);
    }
}

// Manejo de señales de terminación
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await rabbitmqConsumer.close();
    await sequelize.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await rabbitmqConsumer.close();
    await sequelize.close();
    process.exit(0);
});

// Iniciar el servicio
startService();
