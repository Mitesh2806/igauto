import express from 'express';
import User, { type UserInfo } from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const router = express.Router();

const generateToken = (userId : mongoose.Types.ObjectId) => {
   return jwt.sign({userId}, process.env.JWT_SECRET as string, {expiresIn: "10d"});
}

router.post("/register", async(req, res) => {
  try {
    const {email, instaHandle, password} = req.body;
    
  
    if(!email || !instaHandle || !password) {
      return res.status(400).json({message: "All fields are required"});
    }
    if(password.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters"});
    }
   
  
    const existingEmail = await User.findOne({email});
    if(existingEmail) {
      return res.status(400).json({message: "Email already exists"});
    }
    
    const existingInstahandle = await User.findOne({instaHandle});
    if(existingInstahandle) {
      return res.status(400).json({message: "Insta User already exists"});
    }
    
    
 
    const user: UserInfo = new User({
      email,
      instaHandle,
      password,
    });
    
    await user.save();
    
 
    const token = generateToken(user._id as mongoose.Types.ObjectId);
    

    res.status(201).json({
        token,
        user: {
            id: user._id,
            instaHandle: user.instaHandle,
            email: user.email,
        }
    });
   
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
});

router.post("/login", async(req, res) => {
    try {
       const {instaHandle, password} = req.body;
       
  
       if(!instaHandle || !password) {
           return res.status(400).json({message: "All fields are required"});
       }
       
  
       const user = await User.findOne({instaHandle});
       if(!user) {
           return res.status(400).json({message: "Invalid email or password"});
       }
       
  
       const isPasswordCorrect = await user.comparePassword(password);
       if(!isPasswordCorrect) {
           return res.status(400).json({message: "Invalid email or password"});
       }
       
       
       const token = generateToken(user._id as mongoose.Types.ObjectId);
       
       res.status(200).json({
           token,
           user: {
               id: user._id,
               instaHandle: user.instaHandle,
               email: user.email,
               profileImage: user.profileImage
           }
       });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

export default router;