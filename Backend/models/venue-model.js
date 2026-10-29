const mongoose=require('mongoose')
const VenueSchema=new mongoose.Schema({
    name:String,
    eventDate:Date,
    isBooked:{
        type:Boolean,
        default:false
    },
    createdAt:Date.now()
})
module.exports=mongoose.model('VenueModel',VenueSchema)