const Order=require('../models/order_model');
const Chat=require('../models/chat-model')
const Message=require('../models/message-model')
const SaveMessage=async(req,res)=>{
    try{
        let{user,chatid,message,sender,receiver,orderid}=req.body;
        if(!message) return res.status(401).json({"message":"Message is Empty"});
        let chat=await Chat.findOne(chatid);
        const order=await Order.findById(order._id);
        if(!chat) chat=await Chat.create({
            name:order.name,
            user:[sender,receiver]
        });
        const newMessage=await Message.create({
            sender,
            chat:chat._id,
            content:message
        });
        await Chat.findByIdAndUpdate(chat._id, { latestMessage: newMessage._id });
        return res.status(201).json({
            "message":"Message sent successfully"
        });
    }
    catch(e){
        return res.status(501).json({
            "message":"Failed to send"
        });
    }
}
const getChat=async(req,res)=>{
    try{
        let userid =req.user._id;
        const chats=await Chat.findById(userid);
        return res.status(200).json({
            chats
        })
    }
    catch(e){
        return res.status(501).json({
            "message":"Internal Server Error"
        });
    }
}
const getChatHistory=async(req,res)=>{
    try{
        let chatid=req.body;
        const messages=await Message.findById(chatid);
        return res.status(200).json({
            messages     
        });
    }
    catch(e){
        return res.status(501).json({
            "message":"Internal Server Error"
        });
    }
}
module.exports={SaveMessage,getChat,getChatHistory}