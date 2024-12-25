import { Router } from "express";
import CommentModel, { IComment } from "../models/comment.model";
import BaseController from "../controllers/baseController";

const commentController = new BaseController<IComment>(CommentModel);
const router = Router();

router.post("/", (req, res) => commentController.create(req, res));
router.get("/", (req, res) => commentController.getAll(req, res));
router.get("/:id", (req, res) => commentController.getById(req, res));
router.put("/:id", (req, res) => commentController.update(req, res));
router.delete("/:id", (req, res) => commentController.delete(req, res));

export default router;
