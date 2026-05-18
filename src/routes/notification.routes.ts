import { Router } from 'express';
import { createNotification, getAdminNotifications, getCitizenNotifications } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (Admin/Operator only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - target_type
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [general, alert, emergency]
 *               target_type:
 *                 type: string
 *                 enum: [all, citizens, staff, department]
 *               department_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'operator']), createNotification);

/**
 * @swagger
 * /api/notifications/admin:
 *   get:
 *     summary: Fetch notifications for admins and department staff
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/admin', authMiddleware, getAdminNotifications);

/**
 * @swagger
 * /api/notifications/citizen:
 *   get:
 *     summary: Fetch notifications for citizens (Public feed)
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Public notifications list
 */
router.get('/citizen', getCitizenNotifications);

export default router;
