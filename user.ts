import mongoose, { Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: 'guest' | 'admin';
}

export interface UserModel extends Model<UserDocument> {}

const userSchema = new mongoose.Schema<UserDocument>({ 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
});

const User = mongoose.model<UserDocument, UserModel > ('User', userSchema);

export default User;