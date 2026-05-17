import { Router } from 'express';
import {
	registerCitizen,
	getCitizen,
	getCitizenAlerts,
	getCitizenProfile,
	updateCitizenProfile,
	getPublicCitizenAlerts,
	getCitizenAlertById,
	addCitizenAlertMessage,
	getCitizenAlertStats,
} from '../controllers/citizen.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Citizen:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         full_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         home_lat:
 *           type: number
 *         home_lng:
 *           type: number
 *         device_id:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *     CitizenAlert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         category:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         media_url:
 *           type: string
 *           nullable: true
 *         location_lat:
 *           type: number
 *           nullable: true
 *         location_lng:
 *           type: number
 *           nullable: true
 *         status:
 *           type: string
 *         priority:
 *           type: string
 *         created_by:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         due_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         resolved_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

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
 * /api/citizens/alerts/public:
 *   get:
 *     summary: Get public feed of alerts created by citizens
 *     tags: [Citizens]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Citizen alerts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CitizenAlert'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/alerts/public', getPublicCitizenAlerts);

/**
 * @swagger
 * /api/citizens/profile/{id}:
 *   get:
 *     summary: Get citizen profile by ID
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Citizen profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Citizen'
 *       404:
 *         description: Citizen not found
 *   patch:
 *     summary: Update citizen profile by ID
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               home_lat:
 *                 type: number
 *               home_lng:
 *                 type: number
 *               device_id:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Citizen profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Citizen'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Citizen not found
 */
router.get('/profile/:id', getCitizenProfile);
router.patch('/profile/:id', updateCitizenProfile);

/**
 * @swagger
 * /api/citizens/{id}/alerts/stats:
 *   get:
 *     summary: Get alert statistics for a citizen
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Alert statistics fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     statusCounts:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     categoryCounts:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     priorityCounts:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     resolvedCount:
 *                       type: integer
 *                     slaBreachedCount:
 *                       type: integer
 *                     resolutionRate:
 *                       type: integer
 *                     recentAlerts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CitizenAlert'
 */
router.get('/:id/alerts/stats', getCitizenAlertStats);

/**
 * @swagger
 * /api/citizens/{id}/alerts/{alertId}:
 *   get:
 *     summary: Get a single alert detail for a citizen
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Citizen alert detail fetched
 *       404:
 *         description: Alert not found for this citizen
 */
router.get('/:id/alerts/:alertId', getCitizenAlertById);

/**
 * @swagger
 * /api/citizens/{id}/alerts/{alertId}/messages:
 *   post:
 *     summary: Add a citizen message to an alert thread
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               sender_name:
 *                 type: string
 *                 description: Optional display name for message sender
 *     responses:
 *       201:
 *         description: Message created
 *       400:
 *         description: Message content is required
 *       404:
 *         description: Alert not found for this citizen
 */
router.post('/:id/alerts/:alertId/messages', addCitizenAlertMessage);

/**
 * @swagger
 * /api/citizens/{id}/alerts:
 *   get:
 *     summary: Get alerts created by a specific citizen
 *     tags: [Citizens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Citizen alerts fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CitizenAlert'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/:id/alerts', getCitizenAlerts);

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
