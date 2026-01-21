const { Product } = require('../models/Product');

class InventoryService {
    
    async getProductStock(productId) {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }
        return {
            productId: product.productId,
            name: product.name,
            availableStock: product.availableStock,
            reservedStock: product.reservedStock
        };
    }

    async checkAndReserveStock(items) {
        const unavailableItems = [];
        const reservedItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            
            if (!product) {
                unavailableItems.push({
                    productId: item.productId,
                    reason: 'Product not found'
                });
                continue;
            }

            if (product.availableStock < item.quantity) {
                unavailableItems.push({
                    productId: item.productId,
                    requested: item.quantity,
                    available: product.availableStock,
                    reason: 'Insufficient stock'
                });
                continue;
            }

            // Reservar stock
            product.availableStock -= item.quantity;
            product.reservedStock += item.quantity;
            await product.save();

            reservedItems.push({
                productId: item.productId,
                quantity: item.quantity
            });
        }

        if (unavailableItems.length > 0) {
            // Revertir reservas si algún item no está disponible
            await this.releaseReservedStock(reservedItems);
            return {
                success: false,
                unavailableItems
            };
        }

        return {
            success: true,
            reservedItems
        };
    }

    async releaseReservedStock(items) {
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                product.availableStock += item.quantity;
                product.reservedStock -= item.quantity;
                await product.save();
            }
        }
    }

    async confirmReservation(items) {
        // En un sistema real, aquí se marcarían las reservas como confirmadas
        // Por ahora, solo mantenemos el stock reservado
        console.log('Reservation confirmed for items:', items);
    }
}

module.exports = new InventoryService();
