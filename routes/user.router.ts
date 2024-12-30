import { Router, Request, Response } from "express";
import userController from "../controllers/user.controller";

const router = Router();

// Get all users
router.get("/", async (req: Request, res: Response): Promise<void> => {
    await userController.getAll(req, res);
});

// Get user by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.getById(req, res);
});

// Create a new user
router.post("/", async (req: Request, res: Response): Promise<void> => {
    await userController.create(req, res);
});

// Update a user by ID
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.update(req, res);
});

// Delete a user by ID
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    await userController.delete(req, res);
});

export default router;
