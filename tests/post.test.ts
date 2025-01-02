import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../models/post.model";
import testPosts from "./test_posts.json";

var app: Express;
let postId: string = "";
const userId: string = "888f888f8f8888f88f8f8f8f";

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();

    // await Post.insertMany(testPosts); //Run only if it does not exist in the DB
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();
    done();
});

describe("Post Tests", () => {
    test("Get all posts", async () => {
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test("Create a post", async () => {
        const newPost = {
            title: "New Post Title",
            content: "This is a new post.",
            sender: userId,
        };
        const response = await request(app).post("/posts").send(newPost);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newPost.title);
        expect(response.body.content).toBe(newPost.content);
        postId = response.body._id;
    });

    test("Get post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    });

    test("Update a post", async () => {
        const updatedPost = { title: "Updated Post Title", content: "Updated post content" };
        const response = await request(app)
            .put(`/posts/${postId}`)
            .send(updatedPost);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedPost.title);
        expect(response.body.content).toBe(updatedPost.content);
    });

    test("Delete a post", async () => {
        const response = await request(app).delete(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Item deleted successfully");
    });
});
