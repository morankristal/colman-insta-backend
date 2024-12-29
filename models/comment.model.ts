import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
    post: Types.ObjectId; // Reference to the Post model
    content: string;
    sender: Types.ObjectId; // Reference to the User model
    createdAt: Date;
}

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

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
