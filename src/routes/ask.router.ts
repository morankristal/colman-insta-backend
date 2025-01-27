import { Router, Request, Response } from "express";
import askController from "../controllers/ask.controller";

const router = Router();

/**
 * @swagger
 * /ai:
 *   post:
 *     summary: Ask a question to AI
 *     description: Sends a question in the request body to the AI and retrieves the response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The question to ask the AI.
 *                 example: "What is the best city in Israel"
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
 *                   example: "Netanya is the best city in Israel."
 *       400:
 *         description: Bad request, prompt is required.
 *       500:
 *         description: Internal server error.
 */
router.post("/ai", askController.askQuestion);


export default router;