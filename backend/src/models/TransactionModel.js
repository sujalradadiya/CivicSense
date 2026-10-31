const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
    {
        issueId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Issue",
            required:true,
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
       authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authority",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "ACCEPTED",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
      ],
      default: "ASSIGNED",
    },
  },
  {
    timestamps: true,
  }
)

const Transaction = mongoose.model("Transaction",TransactionSchema)

module.exports = Transaction;