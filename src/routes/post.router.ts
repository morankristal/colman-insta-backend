import { Router, Request, Response } from "express";
import PostController from "../controllers/post.controller";
import { authMiddleware } from "../common/authentication_middleware";
import upload, { handleUploadErrors } from "../common/uploadMiddleware";


const router = Router();
const postController = new PostController();


/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    await postController.getAll(req, res);
});

/**
 * @swagger
 * /posts/getBySender/{senderId}:
 *   get:
 *     summary: Get posts by sender ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         description: ID of the sender (user)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of posts by sender
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts found for the sender
 */
router.get("/getBySender/:senderId", async (req: Request, res: Response): Promise<void> => {
    await postController.getPostsBySender(req, res);
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePost'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.put("/:id", authMiddleware, upload.single("image"),  async (req: Request, res: Response): Promise<void> => {
    await postController.update(req, res);
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.delete(req, res);
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post content
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Post image
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 */
router.post("/", 
    authMiddleware,
    handleUploadErrors,
    async (req: Request, res: Response): Promise<void> => {
        await postController.create(req, res);
    }
);


/**
 * @swagger
 * /posts/liked:
 *   get:
 *     summary: Get posts liked by the user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of posts liked by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/liked", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.getLikedPosts(req, res);
});

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.post("/:id/like", authMiddleware, async (req: Request, res: Response): Promise<void> => {
    await postController.likePost(req, res);
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    await postController.getById(req, res);
});


export default router;