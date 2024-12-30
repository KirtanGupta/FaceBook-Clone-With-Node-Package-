const mongoose=require("mongoose")
const post=mongoose.Schema({
user:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
],
content:String,
like:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
],
date:{
    type:Date,
    default:Date.now
}

})
const postmodel=mongoose.model("post",post)
module.exports=postmodel