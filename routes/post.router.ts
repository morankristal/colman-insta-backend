import { Router, Request, Response } from "express";
import postController from "../controllers/post.controller";

const router = Router();

// Get all posts
router.get("/", async (req: Request, res: Response): Promise<void> => {
    await postController.getAll(req, res);
});

// Get post by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.getById(req, res);
});

// Create a new post
router.post("/", async (req: Request, res: Response): Promise<void> => {
    await postController.create(req, res);
});

// Update a post by ID
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.update(req, res);
});

// Delete a post by ID
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.delete(req, res);
});

export default router;
