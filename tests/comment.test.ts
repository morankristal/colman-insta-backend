import request from "supertest";
import initApp from "../server";
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
  password: "testpassword",
}

beforeAll(async () => {
    console.log("beforeAll");

    app = await initApp();

    // האם צריך את זה?
    // const userExists = await User.findById(userId); 
    // expect(userExists).not.toBeNull();

    // const postExists = await Post.findById(postId);
    // expect(postExists).not.toBeNull();

    await User.deleteMany();
    await Comment.deleteMany();
    await Post.deleteMany();
    await User.insertMany(testUsers); //Run only if it does not exist in the DB
    await Post.insertMany(testPosts); //Run only if it does not exist in the DB
    await Comment.insertMany(testComments); //Run only if it does not exist in the DB

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

    test("Get comment by ID", async () => {
        const response = await request(app).get(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
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

    test("Delete a comment", async () => {
        const response = await request(app).delete(`/comments/${commentId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
    });
});
