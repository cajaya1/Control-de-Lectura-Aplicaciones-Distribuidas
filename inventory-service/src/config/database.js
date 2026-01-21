require('dotenv').config();

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'inventorydb',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'rootroot',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
};
