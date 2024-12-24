//morankristal-212174882-RonenAnuka-315236448

import 'dotenv/config';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import postRouter from './routes/post.router';
import commentRouter from './routes/comment.router';

const app: Application = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI as string, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
