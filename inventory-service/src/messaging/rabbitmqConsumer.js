const amqp = require('amqplib');
const rabbitmqConfig = require('../config/rabbitmq');
const inventoryService = require('../services/inventoryService');

class RabbitMQConsumer {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            const connectionUrl = `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`;
            
            console.log('Connecting to RabbitMQ...');
            this.connection = await amqp.connect(connectionUrl);
            this.channel = await this.connection.createChannel();

            console.log('Connected to RabbitMQ successfully');

            // Declarar exchange
            await this.channel.assertExchange(rabbitmqConfig.exchange, 'topic', { durable: true });

            // Declarar queue para OrderCreated
            await this.channel.assertQueue(rabbitmqConfig.queues.orderCreated, { durable: true });
            await this.channel.bindQueue(
                rabbitmqConfig.queues.orderCreated,
                rabbitmqConfig.exchange,
                rabbitmqConfig.routingKeys.orderCreated
            );

            console.log('RabbitMQ setup completed');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async startConsuming() {
        try {
            console.log(`Waiting for messages in ${rabbitmqConfig.queues.orderCreated}...`);
            
            this.channel.consume(
                rabbitmqConfig.queues.orderCreated,
                async (msg) => {
                    if (msg !== null) {
                        await this.handleOrderCreated(msg);
                    }
                },
                { noAck: false }
            );
        } catch (error) {
            console.error('Error starting consumer:', error);
            throw error;
        }
    }

    async handleOrderCreated(msg) {
        try {
            const event = JSON.parse(msg.content.toString());
            console.log('Received OrderCreated event:', event);

            // Verificar y reservar stock
            const result = await inventoryService.checkAndReserveStock(event.items);

            if (result.success) {
                // Stock reservado exitosamente
                await this.publishStockReserved(event.orderId, result.reservedItems, event.correlationId);
            } else {
                // Stock insuficiente o no disponible
                const reason = this.buildRejectionReason(result.unavailableItems);
                await this.publishStockRejected(event.orderId, reason, event.correlationId);
            }

            // Acknowledge message
            this.channel.ack(msg);
        } catch (error) {
            console.error('Error processing OrderCreated event:', error);
            // Reject and requeue message
            this.channel.nack(msg, false, true);
        }
    }

    async publishStockReserved(orderId, reservedItems, correlationId) {
        const event = {
            eventType: 'StockReserved',
            orderId,
            reservedItems,
            correlationId
        };

        console.log('Publishing StockReserved event:', event);

        this.channel.publish(
            rabbitmqConfig.exchange,
            rabbitmqConfig.routingKeys.stockReserved,
            Buffer.from(JSON.stringify(event)),
            { persistent: true, contentType: 'application/json' }
        );
    }

    async publishStockRejected(orderId, reason, correlationId) {
        const event = {
            eventType: 'StockRejected',
            orderId,
            reason,
            correlationId
        };

        console.log('Publishing StockRejected event:', event);

        this.channel.publish(
            rabbitmqConfig.exchange,
            rabbitmqConfig.routingKeys.stockRejected,
            Buffer.from(JSON.stringify(event)),
            { persistent: true, contentType: 'application/json' }
        );
    }

    buildRejectionReason(unavailableItems) {
        const reasons = unavailableItems.map(item => {
            if (item.reason === 'Product not found') {
                return `Product ${item.productId} not found`;
            }
            return `Product ${item.productId}: requested ${item.requested}, available ${item.available}`;
        });
        return reasons.join('; ');
    }

    async close() {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}

module.exports = new RabbitMQConsumer();
