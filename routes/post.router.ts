import { Router, Request, Response } from "express";
import postController from "../controllers/post.controller";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
    await postController.getAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.getById(req, res);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
    await postController.create(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.delete(req, res);
});

export default router;
