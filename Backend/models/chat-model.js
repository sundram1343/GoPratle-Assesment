const mongoose=require('mongoose')
const chatSchema=new mongoose.Schema({
    name:String,
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    messages:[
        {
            sender:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            content:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Message'
            },
            createdAt:Date.now()
        }
    ]
})
module.exports=mongoose.model('Chat',chatSchema);