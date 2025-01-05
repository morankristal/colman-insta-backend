import { Request, Response } from "express";
import Comment from "../models/comment.model";
import { IComment } from "../models/comment.model";
import BaseController from "./baseController";

class CommentController extends BaseController<IComment> {
    constructor() {
        super(Comment);
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

export default CommentController;