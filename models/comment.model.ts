import { Schema, model, Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IComment extends Document {
    post: Schema.Types.ObjectId;
    content: string;
    sender: Schema.Types.ObjectId;
    createdAt: Date;
    _id: string;
}

const commentSchema = new Schema<IComment>({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        validate: {
            validator: async function (value: Schema.Types.ObjectId) {
                const postExists = await mongoose.model('Post').findById(value);
                return !!postExists;
            },
            message: 'Post does not exist',
        },
    },
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function (value: Schema.Types.ObjectId) {
                const userExists = await mongoose.model('User').findById(value);
                return !!userExists;
            },
            message: 'Sender does not exist',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


commentSchema.pre('save', async function (next) {
    const postExists = await mongoose.model('Post').findById(this.post);
    if (!postExists) {
        const error = new Error('Post does not exist');
        return next(error);
    }

    const userExists = await mongoose.model('User').findById(this.sender);
    if (!userExists) {
        const error = new Error('Sender does not exist');
        return next(error);
    }

    next();
});

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
