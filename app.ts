//morankristal-212174882-RonenAnuka-315236448

import 'dotenv/config';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import postRouter from './routes/post.router';
import commentRouter from './routes/comment.router';
import userRouter from "./routes/user.router";

const app: Application = express();

app.use(bodyParser.json());

app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/users', userRouter)

mongoose
    .connect(process.env.MONGO_URI as string, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
