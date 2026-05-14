import { Router } from 'express';
import multer from 'multer';
import { uploadMedia } from '../controllers/media.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Standalone media upload
 *     tags: [Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.post('/upload', upload.single('file'), uploadMedia);

export default router;
