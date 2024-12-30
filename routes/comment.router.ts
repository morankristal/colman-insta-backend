import { Router, Request, Response } from "express";
import commentController from "../controllers/comment.controller";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
    await commentController.getAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.getById(req, res);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
    await commentController.create(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await commentController.delete(req, res);
});

export default router;
