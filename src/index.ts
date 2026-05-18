import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import alertRoutes from "./routes/alert.routes";
import noticeRoutes from "./routes/notice.routes";
import departmentRoutes from "./routes/department.routes";
import citizenRoutes from "./routes/citizen.routes";
import authRoutes from "./routes/auth.routes";
import mediaRoutes from "./routes/media.routes";
import staffRoutes from "./routes/staff.routes";
import notificationRoutes from "./routes/notification.routes";
// import { authMiddleware } from './middleware/auth.middleware';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

const options = {
  customCssUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
  ],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
