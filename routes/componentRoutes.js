import express from 'express';
import {
  getComponents,
  getComponentById,
  createComponent,
  seedComponents,
  updateComponent,
  deleteComponent,
} from '../controllers/componentController.js';
import { verifyAdminToken, verifyAdminKey } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getComponents);
router.get('/:id', getComponentById);

// Admin routes (seed with admin key)
router.post('/seed', verifyAdminKey, seedComponents);

// Admin routes (JWT protected)
router.post('/', verifyAdminToken, createComponent);
router.put('/:id', verifyAdminToken, updateComponent);
router.delete('/:id', verifyAdminToken, deleteComponent);

export default router;
