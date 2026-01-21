const express = require('express');
const inventoryService = require('../services/inventoryService');

const router = express.Router();

// GET /api/v1/products/:productId/stock
router.get('/products/:productId/stock', async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(`Request to get stock for product: ${productId}`);
        
        const stock = await inventoryService.getProductStock(productId);
        res.json(stock);
    } catch (error) {
        console.error('Error getting product stock:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
