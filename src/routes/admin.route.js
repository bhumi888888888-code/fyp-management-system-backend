import express from "express";
import { createStudent,
   updateStudent,
   deleteStudent,
   createTeacher,
   deleteTeacher ,
   updateTeacher,
   getAllUsers,
  getAllProjects,
  getDashboardStats,
  assignSupervisor,
  getProject,
  updateProjectStatus,
} from "../controllers/admin.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(
  isAuthenticated,
  isAuthorized("Admin"),)

router.post(
  "/create-student",
  createStudent
);
router.put(
  "/update-student/:id",
  updateStudent
);
router.delete(
  "/delete-student/:id",
  deleteStudent
);
router.post(
  "/create-teacher",
   createTeacher
);
router.put(
  "/update-teacher/:id",
  updateTeacher
);
router.delete(
  "/delete-teacher/:id",
  deleteTeacher
);
router.get(
  "/users",
  getAllUsers
);
router.get(
  "/projects",
  getAllProjects
);
router.get(
  "/fetch-dashboard-stats",
  getDashboardStats
);
router.post(
  "/assign-supervisor",
  assignSupervisor
);
router.get(
  "/project/:id",
  getProject,
);
router.put(
  "/project/:id",
  updateProjectStatus,
);

export default router;
