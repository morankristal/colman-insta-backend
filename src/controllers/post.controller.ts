import { Request, Response } from "express";
import Post from "../models/post.model";
import { IPost } from "../models/post.model";
import BaseController from "./baseController";

// const postController = new BaseController<IPost>(Post);

class PostController extends BaseController<IPost> {
    constructor() {
        super(Post);
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updateData = req.body;
        const userId = req.params.userId;

        console.log(req.params.userId)
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
}

export default PostController;