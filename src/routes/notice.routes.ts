import { Router } from 'express';
import multer from 'multer';
import { createNotice, getNotices, deleteNotice, getNoticeById, updateNotice } from '../controllers/notice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * components:
 *   schemas:
 *     Notice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         media_url:
 *           type: string
 *         created_at:
 *           type: string
 */

/**
 * @swagger
 * /api/notices:
 *   post:
 *     summary: Create a new notice (Admin only)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notice created successfully
 *   get:
 *     summary: Get all notices
 *     tags: [Notices]
 *     responses:
 *       200:
 *         description: List of notices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notice'
 */

/**
 * @swagger
 * /api/notices/{id}:
 *   get:
 *     summary: Get notice by ID
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notice details
 *   put:
 *     summary: Update a notice (Admin only)
 *     tags: [Notices]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notice updated
 *   delete:
 *     summary: Delete a notice (Admin only)
 *     tags: [Notices]
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
 *         description: Notice deleted
 */
router.post('/', authMiddleware, upload.single('file'), createNotice);
router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.put('/:id', authMiddleware, upload.single('file'), updateNotice);
router.delete('/:id', authMiddleware, deleteNotice);

export default router;
