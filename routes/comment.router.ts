import { Router, Request, Response } from "express";
import CommentController from "../controllers/comment.controller";
import { authMiddleware } from "../common/authentication_middleware";

const router = Router();

const commentController = new CommentController();

router.get("/", async (req: Request, res: Response): Promise<void> => {
    await commentController.getAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.getById(req, res);
});

router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await commentController.create(req, res);
});

router.put("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await commentController.update(req, res);
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await commentController.delete(req, res);
});

export default router;
