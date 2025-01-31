import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    _id: string;
    refreshToken: string[];
    profilePicture: string;
    googleId?: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,  // Ensures that the username is unique
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function (this: IUser) { return !this.googleId; },
        validate: {
            validator: function (v: string) {
                return !!this.googleId || v.length > 0;
            },
            message: "Password is required"
        },
    },

    refreshToken: {
        type: [String],
        default: [],
    },

    profilePicture: {
        type: String,
        default: '',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { versionKey: false });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', userSchema);
export default User;
