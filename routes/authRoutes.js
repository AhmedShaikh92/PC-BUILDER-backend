import express from 'express';
import { registerAdmin, loginAdmin, getCurrentAdmin } from '../controllers/authController.js';
import { verifyAdminToken, verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// Register new admin (protected with admin key for initial setup)
router.post('/register', verifyAdminKey, registerAdmin);

// Login admin
router.post('/login', loginAdmin);

// Get current admin (JWT protected)
router.get('/me', verifyAdminToken, getCurrentAdmin);

export default router;
