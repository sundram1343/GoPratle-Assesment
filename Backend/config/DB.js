const mongoose=require('mongoose')
const DBConnect=async()=>{
    try{
        await mongoose.connect(process.env.DB_URL)
        console.log("Database Connected")
    }
    catch(e){
        console.log("Failed to connect to the database")
    }
}

module.exports = DBConnect;