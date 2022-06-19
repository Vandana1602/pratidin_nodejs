const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:[true,'Email already exist']
    },

    password:{
        type:String,
        required:true
    },
    posts:{
        type: [Schema.Types.ObjectId],
        ref: 'Blog'
    }
})


module.exports=mongoose.model('User',userSchema);