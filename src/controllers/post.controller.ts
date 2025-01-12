import { Request, Response } from "express";
import Post from "../models/post.model";
import { IPost } from "../models/post.model";
import BaseController from "./baseController";
import mongoose from "mongoose";

// const postController = new BaseController<IPost>(Post);

class PostController extends BaseController<IPost> {
    constructor() {
        super(Post);
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updateData = req.body;
        const userId = req.params.userId;
        try {
            const item = await this.model.findById(id);
            if (!item) {
                return res.status(404).send("Not found");
            }

            if(userId && userId !== item.sender.toString()){
                return res.status(403).send("You are not authorized to update this post");
            }

            const updatedItem = await this.model.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).send(updatedItem);
        } catch (error) {
            res.status(400).send(error);
        }
    }


    async delete(req: Request, res: Response): Promise<Response> {
        const id = req.params.id;
        const userId = req.params.userId;

        try {
            const item = await this.model.findById(id);
            if (!item) {
                return res.status(404).send("Not found");
            }

            if (userId && userId !== item.sender.toString()) {
                return res.status(403).send("You are not authorized to delete this post");
            }

            await this.model.findByIdAndDelete(id);
            return res.status(200).send({ message: "Post deleted successfully" });
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    async getPostsBySender(req: Request, res: Response) {
        const userId = req.params.senderId;

        try {
            const posts = await this.model.find({ sender: userId });

            if (posts.length === 0) {
                return res.status(404).send("No posts found for this sender");
            }

            res.status(200).send(posts);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async likePost(req: Request, res: Response){
        const postId = req.params.id;
        const userId = req.params.userId;

        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const userIdObjectId = new mongoose.Types.ObjectId(userId);

            if (post.likes.some((id) => id.equals(userIdObjectId))) {
                post.likes = post.likes.filter((id) => !id.equals(userIdObjectId));
                await post.save();
                return res.status(200).send({ message: "Post unliked successfully" });
            } else {
                post.likes.push(userIdObjectId);
                await post.save();
                return res.status(200).send({ message: "Post liked successfully" });
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getLikedPosts(req: Request, res: Response) {
        const userId = req.params.userId;
        try {
            const posts = await Post.find({ likes: userId });

            if (!posts || posts.length === 0) {
                return res.status(404).send({ message: "No liked posts found" });
            }
            res.status(200).send(posts);
        } catch (error) {
            res.status(400).send({ message: "Error retrieving liked posts" });
        }
    }

}

export default PostController;