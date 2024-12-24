import { Router } from 'express';
import {
    addComment,
    getCommentByID,
    updateComment,
    deleteComment,
    getCommentsByPostId,
} from '../controllers/comment.controller';

const router: Router = Router();

router.post('/', addComment);
router.get('/:id', getCommentByID);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.get('/post/:postId', getCommentsByPostId);

export default router;
