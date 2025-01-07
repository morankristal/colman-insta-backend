import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import Post from "../models/post.model";
import testPosts from "./test_posts.json";
import testUsers from "./test_users.json";
import User ,{ IUser } from "../models/user.model";

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
    await User.insertMany(testUsers); //Run only if it does not exist in the DB
    await Post.insertMany(testPosts); //Run only if it does not exist in the DB

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

    test("Create a post", async () => {
        const newPost = {
            title: "New Post Title",
            content: "This is a new post.",
            sender: testUser.id,
        };
        const failresponse = await request(app).post("/posts").send(newPost)
        expect(failresponse.statusCode).not.toBe(201)

        console.log(testUser.id)
        const response = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken })
            .send(newPost)
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
            .put(`/posts/${postId}`).set(
                { authorization: "JWT " + testUser.accessToken })
            .send(updatedPost);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(updatedPost.title);
        expect(response.body.content).toBe(updatedPost.content);
    });

    test("Delete a post", async () => {
        const response = await request(app).delete(`/posts/${postId}`).set(
            { authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Post deleted successfully");
    });
});
