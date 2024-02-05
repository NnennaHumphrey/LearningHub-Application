import express, { Request, Response, NextFunction } from "express";
import { displayIndexPage } from "../controller";

const router = express.Router();

/* GET home page. */

router.get("/", displayIndexPage);

export default router;
