"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signup_1 = require("../controller/signup");
const signup_2 = require("../controller/signup");
const login_1 = require("../controller/login");
const login_2 = require("../controller/login");
// import { clearCookieOnLogout } from "../controller/logout";
// implementation start here
const router = express_1.default.Router();
// GET all users route
router.get("/signup", signup_1.signupPage);
// Creating new user
router.post("/signup", signup_2.signupUserFunction);
// new user login
router.get("/login", login_1.loginPage);
router.post("/login", login_2.handleUserLogin);
// log out page
// router.get("/logout", clearCookieOnLogout);
exports.default = router;
