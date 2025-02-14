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
    origin: process.env.BASE_URL, // כתובת האתר שלך
    credentials: true, // מאפשר שליחה של קוקיז
}));

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use('/uploads', express.static('src/common'));
const uploadsPath = path.join(__dirname, 'common');
app.use('/uploads', express.static(uploadsPath));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/ask", askRouter);

// Serve React static files
const frontPath = path.join(__dirname, "front");
app.use(express.static(frontPath));

// Fallback for React's client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(frontPath, "index.html"));
});

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
