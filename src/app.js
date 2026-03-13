import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import studentRoutes from "./routes/student.route.js";
import notificationRoutes from "./routes/notification.route.js";
import projectRoutes from "./routes/project.route.js";
import deadlineRoutes from "./routes/deadline.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { ENV } from "./lib/ENV.js";

const  __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [ENV.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
  methods: ["GET" ,"POST", "DELETE", "PUT", "PATCH"]
})
);

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp")

if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive: true});
if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, {recursive: true});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/admin",adminRoutes);
app.use("/api/v1/student",studentRoutes);
app.use("/api/v1/notification",notificationRoutes);
app.use("/api/v1/project",projectRoutes);
app.use("/api/v1/deadline",deadlineRoutes);
app.use("/api/v1/teacher",teacherRoutes);

app.use(errorMiddleware);

export default app;


// app.use(fileUpload({
//   useTempFiles:true,
//   tempFileDir:"/tmp",
// }));
