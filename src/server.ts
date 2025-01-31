import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";

if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: "./.testenv" });
  } else if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./.envprod" });  // Explicitly load .envprod
  } else {
    dotenv.config(); // Defaults to .env
  }
  
import mongoose from "mongoose";
import bodyParser from "body-parser";
import express, { Express } from "express";
import postRouter from "./routes/post.router";
import commentRouter from "./routes/comment.router";
import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";
import askRouter from "./routes/ask.router";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerOptions from "./swagger";
import path from "path";


const app: Express = express();
app.use(cors({
    origin: 'http://localhost:5173', // כתובת האתר שלך
    credentials: true, // מאפשר שליחה של קוקיז
}));

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static('src/common'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/ask", askRouter);


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
