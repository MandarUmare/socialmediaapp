var express = require('express');
var router = express.Router();
const postModel=require("./posts");
const userModel = require('./users');
const { model, default: mongoose } = require('mongoose');
const upload=require("./multer");
const passport = require('passport');

const { route } = require('../app');
const { error } = require('console');
const localStrategy=require("passport-local").Strategy;
passport.use(new localStrategy(userModel.authenticate()));



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login',{error:req.flash("error")});
});

router.post('/upload/profile',isLoggedIn,upload.single("file"),async function(req, res, next){
  const user=await userModel.findOne({
    username:req.session.passport.user
  });
  user.profile=req.file.filename;
  await user.save();
  res.redirect("/profile");
});

router.get("/profile",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({
    username:req.session.passport.user
  }).populate("posts");


   res.render("profile",{user:user});
});

router.get("/feed",isLoggedIn,async function(req,res){
  const posts=await postModel.find().populate("user");
  console.log(posts);
  res.render("feed",{posts});
});
router.get("/upload",isLoggedIn,function(req,res){
  res.render("upload");
});

// router.get("/upload/",isLoggedIn,function(req,res){
//   res.render("upload");
// });

router.post("/register",function(req,res){
  const {username,email}=req.body;
  let userData=new userModel({
     username:username,
     email:email
   
  });

  userModel.register(userData,req.body.password)
  .then(function(){
   passport.authenticate("local")(req,res,function(){
    res.redirect("profile");
   })
  });
})

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash: true
}),function(req,res){});

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect("/");
  })
});


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}


router.post("/upload",isLoggedIn,upload.single("file"),async (req,res)=>{
  if(!req.file)
  {
    return res.status(400).send("No files were uploaded");
  }
  const user=await userModel.findOne({
    username:req.session.passport.user
  });


  const post=await postModel.create({
    text:req.body.text,
    image:req.file.filename,
    user:user._id,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
module.exports = router;
