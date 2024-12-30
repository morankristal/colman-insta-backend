import { Router, Request, Response } from "express";
import commentController from "../controllers/comment.controller";

const router = Router();

// Get all comments
router.get("/", async (req: Request, res: Response): Promise<void> => {
    await commentController.getAll(req, res);
});

// Get comment by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.getById(req, res);
});

// Create a new comment
router.post("/", async (req: Request, res: Response): Promise<void> => {
    await commentController.create(req, res);
});

// Update a comment by ID
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.update(req, res);
});

// Delete a comment by ID
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.delete(req, res);
});

export default router;
