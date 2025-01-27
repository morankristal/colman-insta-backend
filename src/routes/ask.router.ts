import { Router, Request, Response } from "express";
import askController from "../controllers/ask.controller";

const router = Router();

/**
 * @swagger
 * /ai:
 *   get:
 *     summary: Ask a question to AI
 *     description: Sends a question to the AI and retrieves the response.
 *     responses:
 *       200:
 *         description: AI response retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "This is the AI's response."
 *       500:
 *         description: Internal server error.
 */
router.get("/ai", askController.askQuestion);


export default router;