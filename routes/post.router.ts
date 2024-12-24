import { Router } from 'express';
import {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
} from '../controllers/post.controller';

const router: Router = Router();

router.post('/', addPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);

export default router;
