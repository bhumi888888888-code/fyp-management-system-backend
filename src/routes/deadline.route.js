import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { createDeadline } from "../controllers/deadline.controller.js";

const router = express.Router();

router.post(
  "/create-deadline/:projectId",
  isAuthenticated,
  isAuthorized("Admin"),
  createDeadline
);

export default router;
