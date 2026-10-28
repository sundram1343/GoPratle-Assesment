const User =require('../models/user_model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const regiserUser=async(req,res)=>{
    try{
        let {name,email,password}=req.body;
        email=email.toLowerCase();
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User already exists"})
        }
        const newHased=await bcrypt.hash(password,10);
        const newUser=await User.create({name,email,password:newHased})
        const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET)
        res.status(201).json({message:"User created successfully",token})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}
const loginUser=async(req,res)=>{
    try{
        let {email,password}=req.body;
        email=email.toLowerCase();
        const user= await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User/Password is Wrong"})
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"User/Password is Wrong"})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.status(200).json({message:"User logged in successfully",token})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}
module.exports={regiserUser,loginUser}