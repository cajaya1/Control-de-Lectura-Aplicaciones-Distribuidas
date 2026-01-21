const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging
    }
);

const Product = sequelize.define('Product', {
    productId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    availableStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    reservedStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'products_stock',
    timestamps: true
});

module.exports = { sequelize, Product };
