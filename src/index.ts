import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import alertRoutes from './routes/alert.routes';
import noticeRoutes from './routes/notice.routes';
import departmentRoutes from './routes/department.routes';
import citizenRoutes from './routes/citizen.routes';
import authRoutes from './routes/auth.routes';
import mediaRoutes from './routes/media.routes';
import staffRoutes from './routes/staff.routes';
import { authMiddleware } from './middleware/auth.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes); // Alerts can be public to post, but maybe protected to fetch? 
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/staff', staffRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
