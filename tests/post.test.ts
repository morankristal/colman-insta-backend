import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../src/models/post.model";
import testPosts from "./test_posts.json";
import testUsers from "./test_users.json";
import User ,{ IUser } from "../src/models/user.model";


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
  password: "testpassword",
}

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();

    await Post.deleteMany();
    await User.deleteMany();
    await User.insertMany(testUsers);
    await Post.insertMany(testPosts);

    const res = await request(app).post('/auth/register').send(testUser)
    testUser.id = res.body._id
});

async function loginUser() {
    const response = await request(app).post('/auth/login').send({
    "username": "testuser",
    "password": "testpassword"
    })
    testUser.accessToken = response.body.accessToken
};

beforeEach(async ()=>{
    await loginUser()
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();
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
            image: "src/common/images/1737040457880-רקע עלים ופרחים חום.jpg"
    };
        const failresponse = await request(app).post("/posts").send(newPost)
        expect(failresponse.statusCode).not.toBe(201)
        const response = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken })
            .send(newPost)
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
            expect(response2.body.message).toBe( "Post unliked successfully");

            const response = await request(app)
                .get("/posts/liked")
                .set({ authorization: "JWT " + testUser.accessToken });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe( "No liked posts found");
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
});
