import { Router, Request, Response } from "express";
import PostController from "../controllers/post.controller";
import { authMiddleware } from "../common/authentication_middleware";
const router = Router();

const postController = new PostController();

router.get("/", async (req: Request, res: Response): Promise<void> => {
    await postController.getAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.getById(req, res);
});

router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.create(req, res);
});

router.put("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.update(req, res);
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.delete(req, res);
});

export default router;