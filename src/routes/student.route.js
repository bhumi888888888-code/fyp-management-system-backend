import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { handleUploadError, upload  } from "../middlewares/upload.js";
import {
  getAvailableSupervisors,
   getStudentProject,
   getSupervisor,
   requestSupervisor,
   submitProposal,
   uploadFiles,
   getFeedback,
   getDashboardStats,
   downloadFile } from "../controllers/student.controller.js";
import multer from "multer";

const router = express.Router();

router.use(isAuthenticated, isAuthorized("Student"));

router.get(
  "/project",
  getStudentProject,
)

router.post(
  "/project-proposal",
  submitProposal,
)

router.post(
  "/upload/:projectId",
  upload.array("files", 10),
  handleUploadError,
  uploadFiles,
)

router.get(
  "/fetch-supervisors",
  getAvailableSupervisors,
)

router.get(
  "/supervisor",
  getSupervisor
)

router.post(
  "/request-supervisor",
  requestSupervisor
)

router.get(
  "/feedback/:projectId",
  getFeedback
)

router.get(
  "/fetch-dashboard-stats",
  getDashboardStats
)

router.get(
  "/download/:projectId/:fileId",
  downloadFile
)

export default router;
