const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const axios=require('axios');
const Blog = require('../models/blog.js');
const User = require('../models/user.js');
const {blogSchema,subscribeSchema}= require('../schemas.js');


const requireLogin = (req, res, next) => {
    if (!req.session || req.session.userid == undefined) {
        req.flash('error', 'You have to Log in first');
        return res.redirect('/login');
    }
    next();
}
const validateBlog = (req,res,next)=>{
    const { error } = blogSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',msg);
        res.redirect('/');
    } else {
        next();
    }
}

const validateSubscribe = (req,res,next)=>{
    const { error } = subscribeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',msg);
        res.redirect('/');
    } else {
        next();
    }
}
const helper=async()=>{
    let myHash=new Set();
    const data=await Blog.find({});
    for(let ele of data)
    {
        for(let i of ele.hashtags)
         myHash.add(i);
    }
    return Array.from(myHash).sort();
}



router.get('/', async (req, res) => {
    const data = await Blog.find({},{},{ sort: { 'date' : -1}}).populate('author');
    const hash=await helper();
    res.render('blog/home', {arr: data,hash });
   
});

router.get("/compose",requireLogin, (req, res) => {
    res.render("blog/compose");
});
router.post("/compose",requireLogin,validateBlog, async (req, res) => {
    let {title,content,hashtags}=req.body;
     title=title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    //console.log(title);
    const stringArray = hashtags. split(",");
    //console.log(stringArray);
    const obj = new Blog({title,content,hashtags:stringArray,author:req.session.userid});
    
    const user= await User.findById(req.session.userid);
    user.posts.push(obj);
    await user.save();
     await obj.save();
    //console.log(hell);
    res.redirect("/");
});

router.get("/posts/:id",async (req, res) => {
    const id = req.params.id;
    const obj = await Blog.findById(id).populate('author');
    //console.log(obj);
    if (obj) {
        //console.log(req.session.userid)
        return res.render('blog/post', { post: obj, user_id: req.session.userid});
    }
    res.redirect("/");

});

router.get('/posts/:id/edit',requireLogin,async(req,res)=>{
    try{
    const {id}=req.params;
    const post=await Blog.findById(id);
    //console.log(post._id);
    res.render('blog/edit',{post});
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/');
    }
})
router.post('/edit/:id',requireLogin,validateBlog,async(req,res)=>{
    try{
    //console.log(req.body);
    let {title,content,hashtags,edited}=req.body;
    title=title.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    const stringArray = hashtags. split(",");
    const obj=await Blog.findByIdAndUpdate(req.params.id,{title,content,hashtags:stringArray,author:req.session.userid,edited});
    req.flash('success','Successfully Updated');
    res.redirect('/');
    }
    catch(err)
    {
        console.log(err);
        req.flash('error','Something went wrong');
        res.redirect('/');
    }
})

router.get('/about', (req, res) => {
    res.render('blog/about' )
});




router.get("/subscribe", (req, res) => {
    res.render('blog/subscribe');
})

router.post("/subscribe",validateSubscribe, async (req, res) => {
    var { fname, lname, email } = req.body;
    var data = {
        email_address: email, status: "subscribed", merge_fields: {
            FNAME: fname,
            LNAME: lname
        }
    }
    var jsondata = JSON.stringify(data);
    
    var options = {
        auth: 
        {
            username: "authkey",
            password: process.env.AUTH_PASSWORD
        }
    }
    try {
        var response = await axios.post("https://us5.api.mailchimp.com/3.0/lists/2c4e9d6d4a/members", jsondata, options);
        if (response.status === 200)
        {
            req.flash('success','successfully Subscibed');
            res.redirect('/');
        }
        else{
            req.flash('error','Something went wrong! Try Again later..');
            res.redirect('/');
        }
    }
    catch (err) {
        console.log(err);
        console.log("hello i am error", err.response.data);
        req.flash('error',err.response.data.title);
        res.redirect('/');
    };
});


router.get("/delete/:id",requireLogin, async (req, res) => {
    const id = req.params.id;
    //console.log(id);
    const obj=await Blog.findById(id).populate('author');
    const user=obj.author;
    await User.updateOne( 
  {_id: user._id}, 
  { $pull: {posts:id } } 
)
     await Blog.findByIdAndDelete(id);
    //console.log(obj);
    res.redirect("/");
});

router.get('/search',async(req,res)=>{
    let str=req.query.searchText;
    const arr = await Blog.find({$or:[{ $text:{ $search: str }},{ hashtags: { $elemMatch: { $eq:str } }}]});
    const hash=await helper();
    res.render('blog/search',{arr,hash});
});

module.exports=router;