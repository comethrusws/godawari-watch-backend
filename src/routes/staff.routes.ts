import { Router } from 'express';
import { getStaff, createStaff, deleteStaff } from '../controllers/staff.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: List all staff members
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   full_name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   created_at:
 *                     type: string
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, operator, staff]
 */
router.get('/', authMiddleware, roleMiddleware(['super_admin']), getStaff);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), createStaff);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteStaff);

export default router;
