// admin.ts
import express from "express";
import { authenticate } from "../middleware/authentication";
import {
  adminDashboardDisplay,
  updatedCourseDisplayFunction,
  updateCourseFunction,
  createNewCourseFunction,
  deleteCourseFunction,
  deleteUserFunction,
  createNewCourseDisplayFunction,
} from "../controller/admin";
import multer from "multer";
import path from "node:path";
import { adminMiddleware } from "../middleware/adminMiddleware";
const router = express.Router();

router.use(authenticate);
router.use(adminMiddleware);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Set the destination folder for file uploads
  },
  filename: function (req, file, cb) {
    const courseTitle = req.body.course_title; // Assuming course_title is present in the form data
    console.log(courseTitle);
    const filename = `${courseTitle}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    console.log(filename);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// GET all users route
router.get("/dashboard", adminDashboardDisplay);

// Adding a new course
router.get("/dashboard/add-new-course", createNewCourseDisplayFunction);

router.post(
  "/dashboard/add-new-course",
  upload.single("course_thumbnail_image"),
  createNewCourseFunction
);

// Editing a new course
router.get("/dashboard/edit-course/:id", updatedCourseDisplayFunction);

router.post(
  "/dashboard/edit-course",
  upload.single("course_thumbnail_image"),
  updateCourseFunction
);

// deleting a course
router.delete("/dashboard/delete-course", deleteCourseFunction);

// deleting a user
router.delete("/dashboard/delete-user", deleteUserFunction);

export default router;
