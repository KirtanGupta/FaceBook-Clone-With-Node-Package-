const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/ProJectWithBcrypt")
const user=mongoose.Schema({
username:String,
age:Number,
password:String,
email:String,
profilepic:{
    type:String,
    default:"default.png"
},
post:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }
]
})
const usermodel=mongoose.model("user",user)
module.exports=usermodel