import { Schema, model, Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    sender: Schema.Types.ObjectId;
    createdAt: Date;
    _id: string;
    likes: mongoose.Types.ObjectId[];
    image: string;

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
    likes: [{
        type: mongoose.Types.ObjectId, // עדכון ל-mongoose.Types.ObjectId
        ref: 'User',
        default: []
    }],
    image: {
        type: String,
        required: true
    },


});

/* istanbul ignore next */
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
