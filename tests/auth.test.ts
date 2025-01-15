import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../src/models/post.model";
import { Express } from "express";
import userModel, { IUser } from "../src/models/user.model";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

const baseUrl = "/auth";
var postId = "";

type User = IUser & {
  accessToken?: string,
  refreshToken?: string
  userId?: string
};

const testUser: Partial<User> = {
  username: "testuser",
  email: "test@user.com",
  password: "testpassword",
  profilePicture: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ficon%2Favatar_266033&psig=AOvVaw2QulK1YcmpEdM3cN7scACn&ust=1736347053441000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIiUhP7q44oDFQAAAAAdAAAAABAE",

}

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).toBe(200);
  });
  test("Auth test register fail", async () => {
    const response = await request(app).post(baseUrl + "/register").send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app).post(baseUrl + "/register").send({
      username: "testusername",
      email: "test@mail.com"
    });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app).post(baseUrl + "/register").send({
      username: "",
      email: "test@mail.com",
      password: "testpassword",
    });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth test login", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = response.body._id;
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      username: testUser.username,
      password: "notrightpassword",
    });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app).post(baseUrl + "/login").send({
      username: "notrightusername",
      password: "testpassword",
    });
    expect(response2.statusCode).not.toBe(200);


      process.env.TOKEN_SECRET = ''; // לא להגדיר את הסוד כדי לגרום לכישלון
      const response6 = await request(app).post(baseUrl + "/login").send(testUser);
      expect(response6.statusCode).not.toBe(200); // ציפייה לכישלון

    process.env.TOKEN_SECRET= "c51c41a352c64f067a3e40cc5bbabf2a42ef696d740239401c30d3ae2df9fbf4fe4645e790df1b57cbd83cea13fe624baf95f038ef5ad30030e0eaa86b7dc7fe"

  });

  test("Test refresh token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    const response2 = await request(app).post(baseUrl + "/refresh");
    expect(response2.statusCode).not.toBe(200); // ציפייה לכישלון
  });

  test("Double use refresh token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response.statusCode).toBe(200);
    const refreshTokenNew = response.body.refreshToken;

    const response2 = await request(app).post(baseUrl + "/refresh").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response2.statusCode).not.toBe(200);

    const response3 = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: refreshTokenNew,
    });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Auth test invalid refresh token", async () => {
    const invalidToken = "invalidToken";
    const response = await request(app).post(baseUrl + "/refresh").send({
      refreshToken: invalidToken,
    });
    expect(response.statusCode).not.toBe(200);
  });


  test("Test logout", async () => {
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    const response2 = await request(app)
        .post(baseUrl + "/logout")
        .set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response2.statusCode).toBe(200);
    const response3 = await request(app)
        .post(baseUrl + "/refresh")
        .set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response3.statusCode).not.toBe(200);
  });

  jest.setTimeout(10000);
  test("Test timeout token ", async () => {
    const testUser: Partial<User> = {
      username: "test123",
      email: "test123@user.com",
      password: "testpassword",
    }
    const register = await request(app).post(baseUrl + "/register").send(testUser);
    testUser.id = register.body._id;

    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response2 = await request(app).post("/posts").set(
      { authorization: "JWT " + testUser.accessToken }
    ).send({
      title: "Test Post",
      content: "Test Content",
      sender: testUser.id,
    });
    expect(response2.statusCode).not.toBe(201);

    const response3 = await request(app).post(baseUrl + "/refresh").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;
  });
});

  test("Auth test logout failure", async () => {
    const response = await request(app).post(baseUrl + "/logout").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response.statusCode).not.toBe(200);
  });
