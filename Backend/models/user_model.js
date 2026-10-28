const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:String,
    username:String,
    email:String,
    password:String,
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    },
})
module.exports=mongoose.model("User",userSchema);