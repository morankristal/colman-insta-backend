import { Schema, model, Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    sender: Schema.Types.ObjectId;
    createdAt: Date;
    _id: string;
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


postSchema.pre('save', async function (next) {
    const userExists = await mongoose.model('User').findById(this.sender);
    if (!userExists) {
        const error = new Error('Sender does not exist');
        return next(error);
    }
    next();
});

const Post = model<IPost>('Post', postSchema);
export default Post;
