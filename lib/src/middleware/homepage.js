"use strict";
// import { AuthenticatedRequest } from "../../express";
// import createError from "http-errors";
// import express, { Request, Response, NextFunction } from "express";
// import path from "node:path";
// const sqlite3 = require("sqlite3").verbose();
// // my database
// const mydpPath = path.resolve(__dirname, "../../../", "model/learnhub.db");
// const db = new sqlite3.Database(
//   mydpPath,
//   sqlite3.OPEN_READWRITE,
//   (err: any) => {
//     if (err) return console.log(err);
//   }
// );
// async function checkUserDetailToDisplayHomePage(
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const userDetailFromDatabase = req.session?.token;
//     //console.log("This", userDetailFromDatabase);
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// }
// export { checkUserDetailToDisplayHomePage };
