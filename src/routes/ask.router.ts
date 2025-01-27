import { Router, Request, Response } from "express";
import askController from "../controllers/ask.controller";

const router = Router();

router.get("/ai", askController.askQuestion);


export default router;