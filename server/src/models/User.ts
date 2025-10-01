import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Document, Model } from "mongoose";

// The UserInfo interface now includes a reference to the posts they track
export interface UserInfo extends Document {
  email: string;
  password: string;
  profileImage?: string;
  courses?: mongoose.Types.ObjectId[];
  address?: string;
  trackedPosts?: mongoose.Types.ObjectId[]; 
  instaHandle?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  instaHandle: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  grade:{
    type: String,
  },
  // This array will store references to all posts tracked by this user
  trackedProfile: [{ // <-- ADDED THIS FIELD
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScrapedProfile"
  }]
},{timestamps: true});

// --- No changes needed to the methods below ---

userSchema.pre<UserInfo>("save", async function(next) {
    if(!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(userPassword: any) {
    return await bcrypt.compare(userPassword, this.password);
};

const User: Model<UserInfo> = mongoose.model<UserInfo>("User", userSchema);

export default User;