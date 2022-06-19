const mongoose=require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Calcutta");
const Schema= mongoose.Schema;

const blogSchema= new Schema({
    title:
    {type: String,
      required:true
    },
    content:{type: String,
      required:true
    },
    hashtags:{
      type:[String],
      index:true
    },
    date: { type: Date, default: dateKolkata },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  edited:{
    type:Boolean,
    default:false
  }
  })
  
blogSchema.index({'title':'text'});
  module.exports=mongoose.model('Blog',blogSchema);