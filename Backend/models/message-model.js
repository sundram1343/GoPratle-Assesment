const mongoose=require('mongoose')
const messageSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    chat:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    },
    content:{
        type:String
    },
    createdAt:Date.now()
})
module.exports=mongoose.model('Message',messageSchema);