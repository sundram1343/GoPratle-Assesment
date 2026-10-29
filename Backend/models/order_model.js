const mongoose=require('mongoose');
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
    },
    eventName:String,
    eventStartDate:Date,
    eventEndDate:Date,
    type:String,
    location:String,
    venue:String,    
    category:{
        type:String,
        enum:['planner','performer','crew'],
        required:true
    },
    createdAt:Date.now()
})
module.exports=mongoose.model("Order",orderSchema);