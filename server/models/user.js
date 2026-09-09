const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true, //this means that wheather it is require or not if true means it is require and if false it means it is not require
      select: false,
      minlength: 8,
    },
    profilePic: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);
//{timestamps:true} tells use when the document is created in the collection

module.exports = mongoose.model("users", userSchema);
