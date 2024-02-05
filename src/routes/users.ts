import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import { signupPage } from "../controller/signup";
import { signupUserFunction } from "../controller/signup";
import { loginPage } from "../controller/login";
import { handleUserLogin } from "../controller/login";
// import { clearCookieOnLogout } from "../controller/logout";


// implementation start here
const router = express.Router();

// GET all users route
router.get("/signup", signupPage);

// Creating new user
router.post("/signup", signupUserFunction);

// new user login
router.get("/login", loginPage);

router.post("/login", handleUserLogin);

// log out page
// router.get("/logout", clearCookieOnLogout);

export default router;
