import Post from "../models/post.model";
import { IPost } from "../models/post.model";
import BaseController from "./baseController";

const postController = new BaseController<IPost>(Post);

export default postController;



// import { Request, Response } from 'express';
// import Post from '../models/post.model';
//
// export const addPost = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const post = new Post(req.body);
//         await post.save();
//         res.status(201).json(post);
//     } catch (err: any) {
//         res.status(400).json({ error: err.message });
//     }
// };
//
// export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
//     const filter: string | undefined = req.query.sender as string;
//     try {
//         const posts = filter
//             ? await Post.find({ sender: filter })
//             : await Post.find();
//         res.status(200).json(posts);
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// };
//
// export const getPostById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             res.status(404).json({ error: 'Post not found' });
//             return;
//         }
//         res.json(post);
//     } catch (err: any) {
//         res.status(500).json({ error: err.message });
//     }
// };
//
// export const updatePost = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!post) {
//             res.status(404).json({ error: 'Post not found' });
//             return;
//         }
//         res.json(post);
//     } catch (err: any) {
//         res.status(400).json({ error: err.message });
//     }
// };
