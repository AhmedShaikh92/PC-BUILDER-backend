import express from 'express';
import {
  getPricesByComponentId,
  createOrUpdatePrice,
  seedPrices,
  getPriceByComponentAndVendor,
  deletePrice,
} from '../controllers/priceController.js';
import { verifyAdminToken, verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/component/:componentId', getPricesByComponentId);
router.get('/:componentId/:vendor', getPriceByComponentAndVendor);

// Admin routes (seed with admin key)
router.post('/seed', verifyAdminKey, seedPrices);

// Admin routes (JWT protected)
router.post('/', verifyAdminToken, createOrUpdatePrice);
router.delete('/:priceId', verifyAdminToken, deletePrice);

export default router;
