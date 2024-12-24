import { Request, Response } from 'express';
import Comment from '../models/comment.model';

export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getCommentByID = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        res.json(comment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        res.json(comment);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId });
        if (comments.length === 0) {
            res.status(404).json({ message: 'No comments found for this post.' });
            return;
        }
        res.status(200).json(comments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
