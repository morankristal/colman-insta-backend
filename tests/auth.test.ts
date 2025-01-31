import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel, { IUser } from "../src/models/user.model";
import jwt from "jsonwebtoken";

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

type User = IUser & {
  accessToken?: string,
  refreshToken?: string
  userId?: string
};

const testUser: Partial<User> = {
  username: "testuser",
  email: "test@user.com",
  password: "testpassword1",
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
      password: "testpassword1",
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
      password: "notrightpassword1",
    });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app).post(baseUrl + "/login").send({
      username: "notrightusername",
      password: "testpassword1",
    });
    expect(response2.statusCode).not.toBe(200);


    process.env.TOKEN_SECRET = '';
    const response6 = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response6.statusCode).not.toBe(200);

    process.env.TOKEN_SECRET = "c51c41a352c64f067a3e40cc5bbabf2a42ef696d740239401c30d3ae2df9fbf4fe4645e790df1b57cbd83cea13fe624baf95f038ef5ad30030e0eaa86b7dc7fe"

  });

  test("Test refresh token", async () => {
    const response = await request(app).post(baseUrl + "/refresh").set('Cookie', `refreshToken=${testUser.refreshToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    const response2 = await request(app).post(baseUrl + "/refresh");
    expect(response2.statusCode).not.toBe(200);
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
      password: "testpassword1",
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

  test("Fail to create user with missing fields", async () => {
    const invalidUser = { username: "no_password" };
    const response = await request(app).post("/auth/register").send(invalidUser);
    expect(response.statusCode).toBe(400);
  });

  test("Logout with no refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout");
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("No refresh token provided in logout");
  });

  test("Logout with invalid refresh token", async () => {
    const invalidToken = "invalidToken";
    const response = await request(app)
      .post(baseUrl + "/logout")
      .set('Cookie', `refreshToken=${invalidToken}`);
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Logout failed");
  });

  test("Google login with an invalid token", async () => {
    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "invalid_google_token"
    });
    expect(response.statusCode).not.toBe(200);
  });

  test("Login with Google account but no password", async () => {
    const tempUser = {
      "username": "ronen",
      "email": "ronenanuka6@gmail.com",
      "password": "password456",
      "_id": "ggggggg22222222212345678",
      "googleId": "123456789",
      "profilePicture": "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png"
    }
    const response1 = await request(app).post(baseUrl + "/register").send(tempUser);

    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        username: tempUser.username
      });

    expect(response.statusCode).toBe(400);
  });

  test("Google login with missing client ID", async () => {
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = '';

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(response.statusCode).toBe(400);
    process.env.GOOGLE_CLIENT_ID = originalClientId;
  });

  test("Login with missing username", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      password: "testpassword1"
    });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh token with invalid user ID", async () => {
    const fakeToken = jwt.sign(
      { _id: "nonexistentid123", random: "test" },
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=${fakeToken}`);

    expect(response.statusCode).toBe(400);
  });

  test("Refresh token for user with empty refresh token array", async () => {
    const tempUser = {
      username: "tempuser",
      email: "temp@user.com",
      password: "temppass123"
    };

    await request(app).post(baseUrl + "/register").send(tempUser);
    const loginResponse = await request(app).post(baseUrl + "/login").send(tempUser);

    await userModel.updateOne(
      { username: tempUser.username },
      { $set: { refreshToken: [] } }
    );

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=${loginResponse.body.refreshToken}`);

    expect(response.statusCode).toBe(400);
  });

  test("Google login user creation failure", async () => {
    const originalFindOne = userModel.findOne;
    userModel.findOne = jest.fn().mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(response.statusCode).toBe(400);
    userModel.findOne = originalFindOne;
  });

  test("Login with expired token", async () => {
    const expiredToken = jwt.sign(
      { _id: testUser._id, random: "test" },
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "0s" }
    );

    await userModel.updateOne(
      { _id: testUser._id },
      { $push: { refreshToken: expiredToken } }
    );

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=${expiredToken}`);

    expect(response.statusCode).toBe(400);
  });

  test("Failed user save during registration", async () => {
    const originalCreate = userModel.create;
    userModel.create = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post(baseUrl + "/register").send({
      username: "failuser",
      email: "fail@user.com",
      password: "failpass123",
      profilePicture: "https://example.com/pic.jpg"
    });

    expect(response.statusCode).toBe(400);

    userModel.create = originalCreate;
  });

  let mockOAuth2Client: any;

  jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn()
    }))
  }));

  beforeEach(() => {
    mockOAuth2Client = new (require('google-auth-library').OAuth2Client)();
    jest.clearAllMocks();
    if (!process.env.TOKEN_SECRET) {
      process.env.TOKEN_SECRET = "testsecret";
    }
  });

  test("Google login verification failure", async () => {
    mockOAuth2Client.verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "invalid_token"
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain('Google login failed');
  });

  test("Verify refresh token with missing token secret", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    process.env.TOKEN_SECRET = undefined;

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=somevalidtoken`);

    expect(response.statusCode).toBe(400);

    process.env.TOKEN_SECRET = originalSecret;
  });

  test("Google login with database error during user creation", async () => {
    mockOAuth2Client.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google101",
        name: "New Google User",
        email: "new@example.com",
        picture: "https://example.com/pic.jpg"
      })
    });

    const originalSave = userModel.prototype.save;
    userModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(response.statusCode).toBe(400);

    userModel.prototype.save = originalSave;
  });

  const generateToken = (userId: string) => {
    if (!process.env.TOKEN_SECRET) {
      return null;
    }
    const random = Math.random().toString();
    const accessToken = jwt.sign(
      {
        _id: userId,
        random: random
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES || '1h' }
    );

    const refreshToken = jwt.sign(
      {
        _id: userId,
        random: random
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  };

  test("Google login with null payload", async () => {
    mockOAuth2Client.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => undefined
    });

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Google login failed');
  });

  test("Google login server error during token generation", async () => {
    mockOAuth2Client.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "123",
        name: "Test User",
        email: "test@example.com",
        picture: "https://example.com/pic.jpg"
      })
    });

    const originalTokenSecret = process.env.TOKEN_SECRET;
    process.env.TOKEN_SECRET = undefined;

    const response = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain('Google login failed');

    process.env.TOKEN_SECRET = originalTokenSecret;
  });

  test("Refresh token with Google user", async () => {
    mockOAuth2Client.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google123",
        name: "Google User",
        email: "google@example.com",
        picture: "https://example.com/pic.jpg"
      })
    });
    if (!process.env.TOKEN_SECRET) {
      process.env.TOKEN_SECRET = "testsecret";
    }

    const googleLoginResponse = await request(app).post(baseUrl + "/google-login").send({
      credential: "valid_token"
    });

    expect(googleLoginResponse.statusCode).toBe(400);
    const user = await userModel.create({
      username: "Google User",
      email: "google@example.com",
      googleId: "google123",
      password: "",
      profilePicture: "https://example.com/pic.jpg"
    });

    const tokens = generateToken(user._id);
    if (!tokens) throw new Error("Failed to generate tokens");

    const refreshResponse = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=${tokens.refreshToken}`);

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
  });

  test("Login attempt with Google account credentials", async () => {
    const user = await userModel.create({
      username: "Another Google User",
      email: "another@example.com",
      googleId: "google456",
      password: "",
      profilePicture: "https://example.com/pic.jpg"
    });

    const response = await request(app).post(baseUrl + "/login").send({
      username: "Another Google User",
      password: "somepassword"
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('wrong username or password');
  });

  test("Logout with Google user", async () => {
    const user = await userModel.create({
      username: "Google User For Logout",
      email: "logout@example.com",
      googleId: "google789",
      password: "",
      profilePicture: "https://example.com/pic.jpg"
    });

    const tokens = generateToken(user._id);
    if (!tokens) throw new Error("Failed to generate tokens");

    const logoutResponse = await request(app)
      .post(baseUrl + "/logout")
      .set('Cookie', `refreshToken=${tokens.refreshToken}`);

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.text).toBe("Logged out successfully (Google user)");
  });

  test("Verify refresh token with missing token secret", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    process.env.TOKEN_SECRET = undefined;

    const response = await request(app)
      .post(baseUrl + "/refresh")
      .set('Cookie', `refreshToken=somevalidtoken`);

    expect(response.statusCode).toBe(400);

    process.env.TOKEN_SECRET = originalSecret;
  });

  test("Failed user save during registration", async () => {
    const originalCreate = userModel.create;
    userModel.create = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post(baseUrl + "/register").send({
      username: "failuser",
      email: "fail@user.com",
      password: "failpass123",
      profilePicture: "https://example.com/pic.jpg"
    });

    expect(response.statusCode).toBe(400);

    userModel.create = originalCreate;
  });
});

test("Auth test logout failure", async () => {
  const response = await request(app).post(baseUrl + "/logout").set('Cookie', `refreshToken=${testUser.refreshToken}`);
  expect(response.statusCode).not.toBe(200);
});
