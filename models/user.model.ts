import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define an interface for the User document
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the schema for the User model
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
        required: true,
    },
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Add a method to compare passwords
userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = model<IUser>('User', userSchema);
export default User;
