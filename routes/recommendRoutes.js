import express from 'express';
import { getBuildRecommendation, getBuildPrice } from '../controllers/recommendController.js';

const router = express.Router();

// Public routes
router.post('/build', getBuildRecommendation);
router.post('/price', getBuildPrice);

export default router;
