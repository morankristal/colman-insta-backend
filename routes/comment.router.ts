import { Router } from "express";
import CommentModel, { IComment } from "../models/comment.model";
import BaseController from "../controllers/baseController";

const commentController = new BaseController<IComment>(CommentModel);
const router = Router();

// Define routes for managing comments
router.post("/", (req, res) => commentController.create(req, res)); // Create a comment
router.get("/", (req, res) => commentController.getAll(req, res)); // Get all comments
router.get("/:id", (req, res) => commentController.getById(req, res)); // Get a comment by ID
router.put("/:id", (req, res) => commentController.update(req, res)); // Update a comment by ID
router.delete("/:id", (req, res) => commentController.delete(req, res)); // Delete a comment by ID

export default router;






// import { Router } from 'express';
// import {
//     addComment,
//     getCommentByID,
//     updateComment,
//     deleteComment,
//     getCommentsByPostId,
// } from '../controllers/comment.controller';
//
// const router: Router = Router();
//
// router.post('/', addComment);
// router.get('/:id', getCommentByID);
// router.put('/:id', updateComment);
// router.delete('/:id', deleteComment);
// router.get('/post/:postId', getCommentsByPostId);
//
// export default router;
