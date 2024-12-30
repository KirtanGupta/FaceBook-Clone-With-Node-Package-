const express= require("express")
const app=express()
const userModel=require("./models/user")
const postModel=require("./models/post")
const bcrypt=require("bcrypt")
const jwt= require("jsonwebtoken")
const path= require("path")
const cookieParser = require("cookie-parser")
// const multer=require("./config/multer")
const upload = require("./config/multer")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.use(cookieParser())

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/create",async (req,res)=>{
    const {username,age,email,password,}=req.body
    const newuser=await userModel.findOne({email})
    if (newuser){
        return res.status(400).send({message:"user already exist"})
    }
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
           const user = await userModel.create({
                username,
                age,
                email,
                password:hash
            })
            const token=jwt.sign({email,id:user._id},"abc")
            res.cookie("token",token)
            res.redirect("/login")
            // console.log(user)
        })
    })
})
app.get("/profile",isloggedin,async (req,res)=>{
    res.set("Cache-Control", "no-store");
    const user= await userModel.findOne({email:req.user.email}).populate("post")
    // console.log(user)
    res.render("profile",{user})
})
app.get("/profile/upload",(req,res)=>{
    res.render("upload")
})
app.post("/upload",upload.single("image"),isloggedin,async (req,res)=>{
    const user=await userModel.findOne({email:req.user.email})
    user.profilepic=req.file.filename
    await user.save()
    res.redirect("/profile")
})
app.post("/createpost",isloggedin,async (req,res)=>{
   const userdata= await userModel.findOne({email:req.user.email})
    const post=  await postModel.create({
        user:userdata._id,
        content:req.body.content
   })
   userdata.post.push(post._id)
   await userdata.save()
//    console.log(post)
   res.redirect("/profile")

})
app.post("/login",async (req,res)=>{
    const {email,password}=req.body
    const user=await userModel.findOne({email})
    if (!user){
        return res.status(400).send("something went wrong")
    }
    console.log(user.password)
    bcrypt.compare(password,user.password,(err,result)=>{
        if(result){
            const token=jwt.sign({email,id:user._id},"abc")
            res.cookie("token",token)
            res.status(200).redirect("/profile")
        }
        else{
            res.status(400).send({message:"invalid email or password"})
        }
    })
})
app.get("/edit/:id",isloggedin ,async (req,res)=>{
    const post= await postModel.findOne({_id:req.params.id}).populate("user")
    // console.log(post)
    res.render("edit",{post})

})
app.post("/updatepost/:id",isloggedin ,async (req,res)=>{
    const post= await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content})
    // console.log(post)
    res.redirect("/profile")

})
function isloggedin(req,res,next){
    if(req.cookies.token==""){
           res.redirect("/login")
    }
 else{
    
    const data=jwt.verify(req.cookies.token,"abc")
    // console.log(data)
    req.user=data
    next()
}
}
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})
app.listen(3000,(req,res)=>{
    console.log("Server is running on port 3000")
})