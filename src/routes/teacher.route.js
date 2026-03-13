import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
   getTeacherDashboardStats,
   acceptRequest,
   getRequests,
   rejectRequest,
   addFeedback,
   markComplete,
   getAssignedStudents,
   downloadFile,
   getFiles,
 } from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(
  isAuthenticated,
  isAuthorized("Teacher"),
);

router.get(
  "/fetch-dashboard-stats",
  getTeacherDashboardStats,
);

router.get(
  "/requests",
  getRequests
);

router.put(
  "/requests/:requestId/accept",
  acceptRequest
);

router.put(
  "/requests/:requestId/reject",
  rejectRequest
)

router.post(
  "/feedback/:projectId",
  addFeedback
)

router.post(
  "/mark-complete/:projectId",
  markComplete
)

router.get(
  "/assigned-students",
  getAssignedStudents
)

router.get(
  "/download/:projectId/:fileId",
  downloadFile
)

router.get(
  "/files",
  getFiles
)
export default router;
