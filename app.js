if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride=require('method-override');
const session=require('express-session');
const flash=require('connect-flash');
const MongoStore= require('connect-mongo');

const dbUrl=process.env.DB_URL || "mongodb://localhost:27017/blogDB";
const blogRoute=require('./routes/blog.js');
const userRoute=require('./routes/user.js')
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const app = express();



app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static("public"));
const secret = process.env.SECRET || "notagoodone";

const store=  MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on("error",function(e){
    console.log("session store Error!!",e);
})
let sessionConfig={
    secret, //store
    name:'session',
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.user=req.session.userid;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.use('/',blogRoute);
app.use('/',userRoute);
app.get('*',(req,res,next)=>{
    //req.flash('error','Does not exist');
    res.redirect('/');
})

const port=process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

