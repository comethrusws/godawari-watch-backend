import { Router } from 'express';
import { registerCitizen, getCitizen } from '../controllers/citizen.controller';

const router = Router();

/**
 * @swagger
 * /api/citizens/register:
 *   post:
 *     summary: Register a new citizen (Onboarding)
 *     tags: [Citizens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone_number
 *               - home_lat
 *               - home_lng
 *             properties:
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               home_lat:
 *                 type: number
 *               home_lng:
 *                 type: number
 *               device_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Citizen registered
 */
router.post('/register', registerCitizen);

/**
 * @swagger
 * /api/citizens/{phone}:
 *   get:
 *     summary: Get citizen by phone number
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Citizen data
 */
router.get('/:phone', getCitizen);

export default router;
