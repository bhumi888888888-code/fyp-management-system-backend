import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { downloadProjects } from "../controllers/project.controller.js";

const router = express.Router();

// router.get(
//   "/",
//   isAuthenticated,
//   isAuthorized("Admin"),
//   getAllProjects
// )

router.get(
  "/:projectId/files/:fileId/download",
  isAuthenticated,
  downloadProjects
)

export default router
