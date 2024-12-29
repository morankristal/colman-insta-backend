import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    sender: Types.ObjectId; // Reference to the User model
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
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = model<IPost>('Post', postSchema);
export default Post;
