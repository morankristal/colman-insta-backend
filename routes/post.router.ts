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


// import { Router } from 'express';
// import {
//     addPost,
//     getAllPosts,
//     getPostById,
//     updatePost,
// } from '../controllers/post.controller';
//
// const router: Router = Router();
//
// router.post('/', addPost);
// router.get('/', getAllPosts);
// router.get('/:id', getPostById);
// router.put('/:id', updatePost);
//
// export default router;
