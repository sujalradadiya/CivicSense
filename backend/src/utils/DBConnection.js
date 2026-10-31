const mongoose = require("mongoose")

const dbconnection = ()=>{
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1/civicsence";
    mongoose.connect(mongoUri).then(()=>{
        console.log("DB conneted..");
    }).catch((err)=>{
        console.log("error in Db connection:", err.message);  
    })
}
module.exports=dbconnection 