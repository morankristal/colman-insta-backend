import request from "supertest";
import initApp  from "../server";  // עדכון הנתיב בהתאם למיקום של app.ts
import mongoose from "mongoose";
import { Express} from "express";
import commentsModel from "../models/comment.model";
import testComments from "./test_comments.json";  // אם אתה משתמש ב-JSON

var app: Express;  // טיפוס Express
let commentId: string = "";
let server: any;  // טיפוס משתנה עבור השרת

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();
    await commentsModel.deleteMany();
});

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();  // סוגר את חיבור MongoDB
    if (server) {
        server.close(() => {  // סוגר את השרת Express
            done();
        });
    } else {
        done();
    }
});

describe("Comments Tests", () => {
    test("Comments test get all", async () => {
        const response = await request(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);  // מצפה שאין תגובות בהתחלה
    });

    test("Test Create Comment", async () => {
        const response = await request(app).post("/comments").send(testComments[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComments[0].content);
        expect(response.body.sender).toBe(testComments[0].sender);
        commentId = response.body._id;  // שמירת ה-ID של התגובה שנוצרה
    });

    test("Test get comment by sender", async () => {
        const response = await request(app).get(`/comments?sender=${testComments[0].sender}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);  // מצפה לתגובה אחת
        expect(response.body[0].content).toBe(testComments[0].content);
    });

    test("Comments get comment by id", async () => {
        const response = await request(app).get(`/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(testComments[0].content);
    });
});
