var mongoose = require('mongoose');
var Answer = require('../models/answerSchema');
var User = require('../models/userSchema');

var replySchema = new mongoose.Schema({
    reply_body  :   String,
    ans_id      :   {type: mongoose.Schema.Types.ObjectId, ref: 'Answer'},
    timeStamp	:	Date,
    user_id		:	{type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    fullname	:	{type: mongoose.Schema.Types.String, ref : 'User'},
    profile_img	:	{type: mongoose.Schema.Types.String, ref : 'User'}

});

module.exports = mongoose.model('Reply',replySchema);