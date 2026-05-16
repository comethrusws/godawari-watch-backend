import { Router } from 'express';
import { getStaff, createStaff, deleteStaff, updateStaff, getStaffPerformance } from '../controllers/staff.controller';
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
 */

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update a staff member (Admin only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated
 *   delete:
 *     summary: Delete a staff member (Admin only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */
router.get('/', authMiddleware, roleMiddleware(['super_admin']), getStaff);
router.get('/performance', authMiddleware, roleMiddleware(['super_admin']), getStaffPerformance);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), createStaff);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin']), updateStaff);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), deleteStaff);

export default router;
