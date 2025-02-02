import request from "supertest";
import initApp from "../src/server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../src/models/post.model";
import User, { IUser } from "../src/models/user.model";
import testComments from "./test_comments.json";
import testUsers from "./test_users.json";
import testPosts from "./test_posts.json";
import Comment from "../src/models/comment.model";

var app: Express;
let postId: string = "777f777f7f7777f77f1f1f1f";
let commentId: string = "";

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

beforeAll(async () => {
    console.log("beforeAll");

    app = await initApp();

    await User.deleteMany();
    await Comment.deleteMany();
    await Post.deleteMany();
    await User.insertMany(testUsers);
    await Post.insertMany(testPosts);
    await Comment.insertMany(testComments);

    const res = await request(app).post('/auth/register').send(testUser)
    testUser.id = res.body._id

});

async function loginUser() {
    const response = await request(app).post('/auth/login').send({
    "username": "testuser",
    "password": "testpassword1"
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

describe("Comments Tests", () => {
    test("Get all comments", async () => {
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testComments.length);
    });

    test("Fail get all", async () => {
        await mongoose.disconnect();
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(400);
        app = await initApp();
    });


    test("Create a comment", async () => {
        const newComment = {
            post: postId,
            content: "Test comment",
            sender: testUser.id,
        };

        const failresponse = await request(app).post("/comments").send(newComment);
        expect(failresponse.statusCode).not.toBe(201);
        
        const response = await request(app).post("/comments").set(
            { authorization: "JWT " + testUser.accessToken })
            .send(newComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(newComment.content);
        expect(response.body.sender).toBe(newComment.sender);
        commentId = response.body._id;
    });

    test("Fail Create a comment", async () => {
        const newComment = {
            post: postId,
            content: "Test comment",
        };

        await mongoose.disconnect();
        const response = await request(app).post("/comments").set(
            { authorization: "JWT " + testUser.accessToken })
            .send(newComment);
        expect(response.statusCode).not.toBe(201);
        app = await initApp();
    });


    test("Get comment by ID", async () => {
        const response = await request(app).get(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });

    test("Fail Get comment by ID", async () => {
        const response = await request(app).get(`/comments/888f888f8f8888f88f8f8f8f`);
        expect(response.statusCode).toBe(404);

        await mongoose.disconnect();
        const response2 = await request(app).get(`/comments/${commentId}`);
        expect(response2.statusCode).toBe(400);
        app = await initApp();
    });

    test("Update a comment", async () => {
        const updatedComment = { content: "Updated test comment" };
        const response = await request(app)
            .put(`/comments/${commentId}`).set(
            { authorization: "JWT " + testUser.accessToken })
            .send(updatedComment);
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedComment.content);
    });

    test("Update a comment does not exists", async () => {
        const updatedPost = { content: "Updated test comment" };
        const response = await request(app)
            .put(`/comments/888f888f8f8888f88f8f8f8f`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(404);
    });

    test("Update a comment - unauthorized user", async () => {
        const updatedPost = { content: "Updated test comment" };
        const response = await request(app)
            .put(`/comments/777f777f7f7777f77f1f1f1f`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(404);
    });

    test("Get all comments for a specific post", async () => {
        const response = await request(app).get(`/comments/getByPost/777f777f7f7777f77f1f1f1f`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
    });

    test("Get comments for a post with no comments", async () => {
        const emptyPostId = "444f444f4f4444f44f1f1f1f"; // A post ID not in test data
        const response = await request(app).get(`/comments/getByPost/${emptyPostId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
    });

    test("Fail to get comments for a non-existing post", async () => {
        const invalidPostId = "444f444f4f4444f44f1f1f1";
        const response = await request(app).get(`/comments/getByPost/${invalidPostId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(400);
    });



    test("Delete a comment does not exists", async () => {
        const response = await request(app).delete(`/comments/123f123f1f1234f12f1f1f1f`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(404);
    });

    test("Delete a comment - unauthorized user", async () => {
        const response = await request(app).delete(`/comments/777f777f7f7777f77f1f1f1f`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(404);
    });

    test("Delete a comment", async () => {
        const response = await request(app).delete(`/comments/${commentId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
    });
});
