"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../middleware/authentication");
const learners_1 = require("../controller/learners");
const router = express_1.default.Router();
// middleware
router.use(authentication_1.authenticate);
// display learners dashboard
router.get("/", learners_1.displayLearnerDashboard);
exports.default = router;
