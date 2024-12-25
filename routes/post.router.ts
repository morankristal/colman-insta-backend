import { Router } from "express";
import PostModel, { IPost } from "../models/post.model";
import BaseController from "../controllers/baseController";

const postController = new BaseController<IPost>(PostModel);
const router = Router();

router.get("/", (req, res) => postController.getAll(req, res));
router.get("/:id", (req, res) => postController.getById(req, res));
router.post("/", (req, res) => postController.create(req, res));
router.put("/:id", (req, res) => postController.update(req, res));
router.delete("/:id", (req, res) => postController.delete(req, res));

export default router;

