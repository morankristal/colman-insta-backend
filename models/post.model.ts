import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    createdAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = model<IPost>('Post', postSchema);
export default Post;
