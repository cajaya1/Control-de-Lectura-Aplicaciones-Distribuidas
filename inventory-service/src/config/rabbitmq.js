require('dotenv').config();

module.exports = {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: process.env.RABBITMQ_PORT || 5672,
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    exchange: process.env.RABBITMQ_EXCHANGE || 'orders.exchange',
    queues: {
        orderCreated: process.env.RABBITMQ_QUEUE_ORDER_CREATED || 'order.created.queue',
        stockReserved: process.env.RABBITMQ_QUEUE_STOCK_RESERVED || 'stock.reserved.queue',
        stockRejected: process.env.RABBITMQ_QUEUE_STOCK_REJECTED || 'stock.rejected.queue'
    },
    routingKeys: {
        orderCreated: process.env.RABBITMQ_ROUTING_KEY_ORDER_CREATED || 'order.created',
        stockReserved: process.env.RABBITMQ_ROUTING_KEY_STOCK_RESERVED || 'stock.reserved',
        stockRejected: process.env.RABBITMQ_ROUTING_KEY_STOCK_REJECTED || 'stock.rejected'
    }
};
