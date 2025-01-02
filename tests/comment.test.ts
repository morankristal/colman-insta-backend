import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../models/post.model";
import User from "../models/user.model";
import testComments from "./test_comments.json";
import Comment from "../models/comment.model";

var app: Express;
let postId: string = "777f777f7f7777f77f1f1f1f";
let userId: string = "888f888f8f8888f88f8f8f8f";
let commentId: string = "";

beforeAll(async () => {
    console.log("beforeAll");


    app = await initApp();

    const userExists = await User.findById(userId);
    expect(userExists).not.toBeNull();

    const postExists = await Post.findById(postId);
    expect(postExists).not.toBeNull();

     // await Comment.insertMany(testComments); //Run only if it does not exist in the DB

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

    test("Create a comment", async () => {
        const newComment = {
            post: postId,
            content: "Test comment",
            sender: userId,
        };
        const response = await request(app).post("/comments").send(newComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(newComment.content);
        expect(response.body.sender).toBe(newComment.sender);
        commentId = response.body._id;
    });

    test("Get comment by ID", async () => {
        const response = await request(app).get(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    });

    test("Update a comment", async () => {
        const updatedComment = { content: "Updated test comment" };
        const response = await request(app)
            .put(`/comments/${commentId}`)
            .send(updatedComment);
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedComment.content);
    });

    test("Delete a comment", async () => {
        const response = await request(app).delete(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Item deleted successfully");
    });
});
