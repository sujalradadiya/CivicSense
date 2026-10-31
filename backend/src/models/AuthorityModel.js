const mongoose = require("mongoose")

const AuthoritySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        type:{
            type:String,
            required:true,
            enum:["AMC","PANCHAYAT"],
        },
        city:{
            type:String,
            required:true,
            trim:true,
        },//for f321 to state location 
        stateId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"State",
            required:true,
        },// authority contact email,
         email: {
      type: String,
      trim: true,
    },
    // authority contact email,
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
    
)

const Authority = mongoose.model("Authority",AuthoritySchema)

module.exports = Authority;