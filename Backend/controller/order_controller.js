const Order = require('../models/order');
const Venue=require('../models/venue-model')
const {isAvailable}=require('../services/CheckAvailability')
const create_order=async(req,res)=>{
    try{
        let{user,eventName,type,eventStartDate,location,venue,category,eventEndDate}=req.body
        if(!isAvailable(venue,eventStartDate)) return res.status(401).json({"message":"Venue already booked"})
        const newOrder=await Order.create({
            user:user._id,
            eventName,
            eventStartDate,
            eventEndDate,
            type,
            location,
            category,
        });
        const newVenue= await Venue.create({
            name:venue,
            eventDate:eventStartDate,
            isBooked:true,
        });
        return res.status(201).json({
            "message":"Order is created"
        });
    } 
    catch(e){
        return res.status(501).json({
            "message":"Internal Server Error"     
        })
    }
}
const  get_Order=async(res,req)=>{
    try{
        let user= req.body.id
        const order=await Order.findOne({user:user});
        return res.status(200).json({
            "message":"Successful",
            order     
        })
    }
    catch(e){
        return res.status(501).json({
            "message":"Internal Server Error"
        });
    }
}
module.exports={get_Order,create_order}