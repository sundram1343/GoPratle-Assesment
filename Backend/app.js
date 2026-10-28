const express=require("express")
require("dotenv").config()
const app=express();
const DBConnect=require("./config/DB")
app.use(express.json());
DBConnect()
app.listen(process.env.PORT,()=>{
    console.log(`Server is running`)
})