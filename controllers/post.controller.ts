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
                return res.status(403).send("You are not authorized to update this comment");
            }

            const updatedItem = await this.model.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).send(updatedItem);
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default PostController;