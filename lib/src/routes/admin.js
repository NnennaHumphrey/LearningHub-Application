"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// admin.ts
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const admin_1 = require("../controller/admin");
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
router.use(authentication_1.authenticate);
router.use(adminMiddleware_1.adminMiddleware);
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/"); // Set the destination folder for file uploads
    },
    filename: function (req, file, cb) {
        const courseTitle = req.body.course_title; // Assuming course_title is present in the form data
        console.log(courseTitle);
        const filename = `${courseTitle}_${Date.now()}${node_path_1.default.extname(file.originalname)}`;
        console.log(filename);
        cb(null, filename);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// GET all users route
router.get("/dashboard", admin_1.adminDashboardDisplay);
// Adding a new course
router.get("/dashboard/add-new-course", admin_1.createNewCourseDisplayFunction);
router.post("/dashboard/add-new-course", upload.single("course_thumbnail_image"), admin_1.createNewCourseFunction);
// Editing a new course
router.get("/dashboard/edit-course/:id", admin_1.updatedCourseDisplayFunction);
router.post("/dashboard/edit-course", upload.single("course_thumbnail_image"), admin_1.updateCourseFunction);
// deleting a course
router.delete("/dashboard/delete-course", admin_1.deleteCourseFunction);
// deleting a user
router.delete("/dashboard/delete-user", admin_1.deleteUserFunction);
exports.default = router;
