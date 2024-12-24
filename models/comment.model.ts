import { Schema, model, Document } from 'mongoose';

// Define an interface for the Comment document
export interface IComment extends Document {
    post: Schema.Types.ObjectId;
    content: string;
    sender: string;
    createdAt: Date;
}

// Define the schema for the Comment model
const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
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

// Create and export the Comment model
const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
