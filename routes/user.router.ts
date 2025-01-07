import { Router, Request, Response } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
    await userController.getAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.getById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.delete(req, res);
});

export default router;
