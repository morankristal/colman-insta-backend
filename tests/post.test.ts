import request from "supertest";
import initApp from "../src/server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../src/models/post.model";
import testPosts from "./test_posts.json";
import testUsers from "./test_users.json";
import User, { IUser } from "../src/models/user.model";
import fs from 'fs';
import path from "path";


var app: Express;
let postId: string = "";

type User = IUser & {
    accessToken?: string,
    refreshToken?: string
    userId?: string
};

const testUser: Partial<User> = {
    username: "testuser",
    email: "test@user.com",
    password: "testpassword1",
}
const testFilesDir = path.join(__dirname, 'test-files');
const testImagePath = path.join(testFilesDir, 'test-image.jpg');
const testPdfPath = path.join(testFilesDir, 'test-file.pdf');
const uploadDir = path.join(__dirname, '../src/images');

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const safeDeleteFile = (filePath: string) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
};

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();

    await Post.deleteMany();
    await User.deleteMany();
    await User.insertMany(testUsers);
    await Post.insertMany(testPosts);

    const res = await request(app).post('/auth/register').send(testUser)
    testUser.id = res.body._id

    ensureDir(testFilesDir);
    ensureDir(uploadDir);

    // Create test files
    fs.writeFileSync(testImagePath, Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')); // Valid 1x1 GIF
    fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4\n'));
});

async function loginUser() {
    const response = await request(app).post('/auth/login').send({
        "username": "testuser",
        "password": "testpassword1"
    })
    testUser.accessToken = response.body.accessToken
};

beforeEach(async () => {
    await loginUser()
});

afterEach(() => {
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        files.forEach(file => {
            if (file.startsWith('test-')) {
                safeDeleteFile(path.join(uploadDir, file));
            }
        });
    }
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();

    if (fs.existsSync(testFilesDir)) {
        fs.rmSync(testFilesDir, { recursive: true, force: true });
    }

    done();
});

describe("Post Tests", () => {
    test("Get all posts", async () => {
        const response = await request(app).get("/posts")
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test("Fail get all", async () => {
        await mongoose.disconnect();
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(400);
        app = await initApp();
    });


    test("Create a post", async () => {
        const newPost = {
            title: "New Post Title",
            content: "This is a new post.",
            sender: testUser.id,
            image: "images/1737381619830-classic-cheese-pizza-FT-RECIPE0422-31a2c938fc2546c9a07b7011658cfd05.jpg"
        };
        const failresponse = await request(app).post("/posts").send(newPost)
        expect(failresponse.statusCode).not.toBe(201)
        const response = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken }).send(newPost)
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newPost.title);
        expect(response.body.content).toBe(newPost.content);
        postId = response.body._id;
    });

    test("Fail Create a post", async () => {
        const newComment = {
            title: "New Post Title",
            content: "This is a new post.",
            sender: testUser.id,
        };

        await mongoose.disconnect();
        const response = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken })
            .send(newComment);
        expect(response.statusCode).not.toBe(201);
        app = await initApp();
    });

    test("Get post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });

    test("Fail Get post by ID", async () => {
        const response = await request(app).get(`/posts/888f888f8f8888f88f8f8f8f`);
        expect(response.statusCode).toBe(404);

        await mongoose.disconnect();
        const response2 = await request(app).get(`/posts/${postId}`);
        expect(response2.statusCode).toBe(400);
        app = await initApp();
    });

    test("Get posts by sender", async () => {
        const response = await request(app).get(`/posts/getBySender/${testUser.id}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    });


    test("Update a post", async () => {
        const updatedPost = { title: "Updated Post Title", content: "Updated post content" };
        const response = await request(app)
            .put(`/posts/${postId}`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedPost.title);
        expect(response.body.content).toBe(updatedPost.content);
    });

    test("Update post with a new image", async () => {
        const updatedPost = {
            title: "Updated Post with New Image",
            content: "This is an updated post with a new image.",
            image: "images/1737381619830-classic-cheese-pizza-FT-RECIPE0422-31a2c938fc2546c9a07b7011658cfd05.jpg"
        };

        const response = await request(app)
            .put(`/posts/${postId}`)
            .set({ authorization: "JWT " + testUser.accessToken })
            .field("title", updatedPost.title)
            .field("content", updatedPost.content)

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedPost.title);
        expect(response.body.content).toBe(updatedPost.content);
        expect(response.body.image).toContain("images/");
    });

    test("Fail to create post with invalid image type", async () => {
        const newPost = {
            title: "New Post with Invalid Image",
            content: "This post contains an invalid image type.",
            sender: testUser.id,
            image: "images/1737381621052-classic-cheese-pizza-FT-RECIPE0422-31a2c938fc2546c9a07b7011658cfd05.txt"
        };

        const response = await request(app)
            .post("/posts")
            .set({ authorization: "JWT " + testUser.accessToken })
            .field("title", newPost.title)
            .field("content", newPost.content)

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Post validation failed: image: Path `image` is required.");
    });


    test("Update a post does not exists", async () => {
        const updatedPost = { title: "Updated Post Title", content: "Updated post content" };
        const response = await request(app)
            .put(`/posts/888f888f8f8888f88f8f8f8f`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(404);
    });

    test("Update a post - unauthorized user", async () => {
        const updatedPost = { title: "Updated Post Title", content: "Updated post content" };
        const response = await request(app)
            .put(`/posts/777f777f7f7777f77f1f1f1f`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("You are not authorized to update this post");
    });

    describe("Like Tests", () => {
        test("Like a post", async () => {
            const response = await request(app)
                .post(`/posts/${postId}/like`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Post liked successfully");
            const postResponse = await request(app).get(`/posts/${postId}`);
            expect(postResponse.statusCode).toBe(200);
            expect(postResponse.body.likes).toContain(testUser.id);
        });

        test("Unlike a post", async () => {
            const response = await request(app)
                .post(`/posts/${postId}/like`)
                .set({ authorization: "JWT " + testUser.accessToken });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Post unliked successfully");

            const response2 = await request(app)
                .post(`/posts/${postId}/like`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response2.statusCode).toBe(200);
            expect(response2.body.message).toBe("Post liked successfully");
        });

        test("fail like a post", async () => {
            await mongoose.disconnect();
            const response = await request(app)
                .post(`/posts/${postId}/like`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response.statusCode).toBe(400);
            app = await initApp();
        });

        test("Get liked posts", async () => {
            const response = await request(app)
                .get(`/posts/liked`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1); // Assuming 1 post is liked
            expect(response.body[0]._id).toBe(postId);
        });

        test("Like a post - post not found", async () => {
            const response = await request(app)
                .post(`/posts/888f888f8f8888f88f8f8f8f/like`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Post not found");
        });

        test("Get liked posts - no posts liked", async () => {
            const response2 = await request(app)
                .post(`/posts/${postId}/like`)
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response2.statusCode).toBe(200);
            expect(response2.body.message).toBe("Post unliked successfully");

            const response = await request(app)
                .get("/posts/liked")
                .set({ authorization: "JWT " + testUser.accessToken });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("No liked posts found");
        });

        test("fail get liked posts", async () => {
            await mongoose.disconnect();
            const response = await request(app)
                .get("/posts/liked")
                .set({ authorization: "JWT " + testUser.accessToken });
            expect(response.statusCode).toBe(400);
            app = await initApp();
        });
    });


    test("Delete a post does not exists", async () => {
        const response = await request(app).delete(`/posts/123f123f1f1234f12f1f1f1f`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(404);
    });

    test("Delete a post - unauthorized user", async () => {
        const response = await request(app).delete(`/posts/777f777f7f7777f77f1f1f1f`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("You are not authorized to delete this post");
    });

    test("Delete a post", async () => {
        const response = await request(app).delete(`/posts/${postId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Post deleted successfully");
    });

    test('should successfully upload a JPEG image', async () => {
        const response = await request(app)
            .post('/posts')
            .set({ authorization: "JWT " + testUser.accessToken })
            .field('title', 'Test Post with JPEG')
            .field('content', 'This is a test post with a JPEG image')
            .attach('image', testImagePath);

        expect(response.status).toBe(201);
        expect(response.body.image).toBeTruthy();
        expect(response.body.image).toContain('images/');
    });

    test('should successfully upload a PNG image', async () => {
        const pngPath = path.join(__dirname, 'test-files', 'test-image.png');
        fs.writeFileSync(pngPath, Buffer.from('fake png data'));

        const response = await request(app)
            .post('/posts')
            .set({ authorization: "JWT " + testUser.accessToken })
            .field('title', 'Test Post with PNG')
            .field('content', 'This is a test post with a PNG image')
            .attach('image', pngPath);

        expect(response.status).toBe(201);
        expect(response.body.image).toBeTruthy();
        expect(response.body.image).toContain('images/');


        fs.unlinkSync(pngPath);
    });

    test('should handle missing file', async () => {
        const response = await request(app)
            .post('/posts')
            .set({ authorization: "JWT " + testUser.accessToken })
            .field('title', 'Test Post without Image')
            .field('content', 'This is a test post without an image');

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('required');
    });

    test('should handle large files', async () => {
        const largePath = path.join(__dirname, 'test-files', 'large-image.jpg');
        const largeBuffer = Buffer.alloc(25 * 1024 * 1024); 
        fs.writeFileSync(largePath, largeBuffer);

        const response = await request(app)
            .post('/posts')
            .set({ authorization: "JWT " + testUser.accessToken })
            .field('title', 'Test Post with Large Image')
            .field('content', 'This is a test post with a large image')
            .attach('image', largePath);

        expect(response.status).toBe(400);

        fs.unlinkSync(largePath);
    });

    test('should handle multiple simultaneous uploads', async () => {
        const promises = Array(3).fill(null).map(() => 
            request(app)
                .post('/posts')
                .set({ authorization: "JWT " + testUser.accessToken })
                .field('title', 'Simultaneous Upload Test')
                .field('content', 'Testing multiple simultaneous uploads')
                .attach('image', testImagePath)
        );

        const responses = await Promise.all(promises);
        
        responses.forEach(response => {
            expect(response.status).toBe(201);
            expect(response.body.image).toBeTruthy();
            expect(response.body.image).toContain('images/');
        });

        const imageNames = responses.map(response => response.body.image);
        const uniqueImageNames = new Set(imageNames);
        expect(uniqueImageNames.size).toBe(responses.length);
    });
});
