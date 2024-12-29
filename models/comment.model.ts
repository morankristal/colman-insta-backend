import { Schema, model, Document, Types } from 'mongoose';

// Define an interface for the Comment document
export interface IComment extends Document {
    post: Types.ObjectId; // Reference to the Post model
    content: string;
    sender: Types.ObjectId; // Reference to the User model
    createdAt: Date;
}

// Define the schema for the Comment model
const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Reference to the Post model
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

// Create and export the Comment model
const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
