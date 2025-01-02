import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import express, { Express } from "express";
import postRouter from "./routes/post.router";
import commentRouter from "./routes/comment.router";
import userRouter from "./routes/user.router";

const app: Express = express();

app.use(bodyParser.json());
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = (): Promise<Express> => {
    return new Promise((resolve, reject) => {
        if (!process.env.MONGO_URI) {
            reject("MONGO_URI is not defined in .env file");
        } else {
            mongoose
                .connect(process.env.MONGO_URI)
                .then(() => {
                    resolve(app);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

export default initApp;
