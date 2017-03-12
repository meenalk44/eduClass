var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');

module.exports.dicussionShow = function(req, res){
	var discussion_id = req.param('id');
	console.log("fetching data from mongo");
		var entries=[];
		res.render('qna',{entries : JSON.stringify(entries)});	
	
	
	
};		
