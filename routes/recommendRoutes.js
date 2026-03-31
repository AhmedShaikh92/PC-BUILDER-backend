import express from 'express';
import { getProductRecommendation, getProductPrice } from '../controllers/recommendController.js';

const router = express.Router();

// POST /recommend/product
// Body: { budget: Number, useCase: String, brand?: String, type?: 'Laptop' | 'PreBuiltPC' }
router.post('/product', getProductRecommendation);

// POST /recommend/price
// Body: { productIds: String[] }
router.post('/price', getProductPrice);

export default router;