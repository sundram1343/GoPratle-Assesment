const Venue = require('../models/venue-model')
const isAvailable=async(venue,startdate)=>{
    const isBooked=await Venue.exists({
        name:venue,
        eventDate:startdate,
        isBooked:true
    })
    if(isBooked) return false;
    return true;
}
module.exports={isAvailable};