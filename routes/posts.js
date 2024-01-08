const express=require("express");
const mongoose=require("mongoose");




const postSchema=mongoose.Schema({
  text:{
    type:String,
    required:true
  },
  image:{
    type:String
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }
  ,
  description:{
    type:String,
  },
  date:{
    type:Date,
    default:Date.now()
  }
})


module.exports=mongoose.model("post",postSchema);