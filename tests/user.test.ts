import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../src/models/user.model";
import testUsers from "./test_users.json";

var app: Express;
let userId: string = "";

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();

    await User.deleteMany();
    await User.insertMany(testUsers);  //Run only if it does not exist in the DB
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();
    done();
});

describe("User Tests", () => {
    test("User test get all", async () => {
        const response = await request(app).get("/users");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testUsers.length);
    });

    test("Fail get all", async () => {
        await mongoose.disconnect();
        const response = await request(app).get("/users");
        expect(response.statusCode).toBe(400);
        app = await initApp();
    });


    test("Test Create User", async () => {
        const newUser = { username: "unique_user", email: "unique_user@example.com", password: "secure_password", profilePicture: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ficon%2Favatar_266033&psig=AOvVaw2QulK1YcmpEdM3cN7scACn&ust=1736347053441000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIiUhP7q44oDFQAAAAAdAAAAABAE",
        };
        const response = await request(app).post("/auth/register").send(newUser);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(newUser.username);
        expect(response.body.email).toBe(newUser.email);
        expect(response.body.profilePicture).toBe(newUser.profilePicture);
        userId = response.body._id;
    });

    test("User get user by id", async () => {
        const response = await request(app).get(`/users/${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("unique_user");
    });

    test("Fail Get user by ID", async () => {
        const response = await request(app).get(`/users/999f999f9f9999f99f9f9f9f`);
        expect(response.statusCode).toBe(404);

        await mongoose.disconnect();
        const response2 = await request(app).get(`/users/${userId}`);
        expect(response2.statusCode).toBe(400);
        app = await initApp();
    });

    test("Get user by username", async () => {
        const response = await request(app).get(`/users/username/unique_user`);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("unique_user");
    });

    test("Fail to get user by username (not found)", async () => {
        const response = await request(app).get(`/users/username/nonexistent_user`);
        expect(response.statusCode).toBe(404);
    });


    test("Test Update User", async () => {
        const updatedUser = { username: "updated_user", email: "updated_user@example.com" };
        const response = await request(app).put(`/users/${userId}`).send(updatedUser);
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe(updatedUser.username);
        expect(response.body.email).toBe(updatedUser.email);
    });

    test("Test Delete User", async () => {
        const response = await request(app).delete(`/users/${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Item deleted successfully");
    });
});
