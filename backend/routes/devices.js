// backend/routes/devices.js

import express from 'express';
import { controlDevice, getActions } from '../controllers/deviceController.js';

const router = express.Router();

// POST /api/devices/:device (Điều khiển thiết bị)
router.post('/:device', controlDevice);

// GET /api/devices/actions (Lịch sử hành động)
router.get('/actions', getActions);

//router.post('/profile', upload.single('avatar'), updateProfile);
export default router;