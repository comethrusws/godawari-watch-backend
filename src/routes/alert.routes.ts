import { Router } from 'express';
import multer from 'multer';
import { createAlert, getAlerts, updateAlertStatus, getAlertById, getAlertStats, exportAlerts } from '../controllers/alert.controller';
import { getComments, addComment, addCitizenMessage } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         media_url:
 *           type: string
 *         location_lat:
 *           type: number
 *         location_lng:
 *           type: number
 *         status:
 *           type: string
 *         assigned_to:
 *           type: string
 *         created_by:
 *           type: string
 *         created_at:
 *           type: string
 */

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert (Citizen)
 *     tags: [Alerts]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               location_lat:
 *                 type: number
 *               location_lng:
 *                 type: number
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert created successfully
 *   get:
 *     summary: Get all alerts (Admin only)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 */

/**
 * @swagger
 * /api/alerts/{id}:
 *   patch:
 *     summary: Update alert status/assignment (Admin only)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert updated successfully
 */
router.post('/', upload.single('file'), createAlert);
router.get('/', authMiddleware, getAlerts);
router.get('/export', authMiddleware, exportAlerts);
router.get('/stats', authMiddleware, getAlertStats);
router.get('/:id', authMiddleware, getAlertById);
router.patch('/:id', authMiddleware, updateAlertStatus);

router.get('/:alertId/comments', authMiddleware, getComments);
router.post('/:alertId/comments', authMiddleware, addComment);
router.post('/:alertId/messages', authMiddleware, addCitizenMessage);

export default router;
