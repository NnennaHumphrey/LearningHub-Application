import express from "express";
import { authenticate } from "../middleware/authentication";
import { displayLearnerDashboard } from "../controller/learners";

const router = express.Router();

// middleware
router.use(authenticate);

// display learners dashboard
router.get("/", displayLearnerDashboard);

export default router;
