const joi = require('joi');

module.exports.blogSchema = joi.object({
    title:joi.string().required().label("Title"),
    content:joi.string().required().label("Content"),
    edited:joi.bool().default(false),
    hashtags:joi.string().empty('')
});

module.exports.subscribeSchema=joi.object({
    fname:joi.string().required().label("First Name"),
    lname:joi.string().required().label("Last Name"),
    email:joi.string().email().required().label("Email")
})

module.exports.userSchema=joi.object({
    name:joi.string().required().label("Full Name"),
    email:joi.string().email().required().label("Email for User"),
    password:joi.string().min(6).max(30).required().label("Password"),
})