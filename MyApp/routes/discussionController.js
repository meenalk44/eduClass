var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');
var Question = require('../models/questionSchema');
var Answer = require('../models/answerSchema');

module.exports.dicussionShow = function(req, res){
	var discussion_id = req.param('id');
	console.log("fetching data from mongo");
	Question.find({'discussion_id':discussion_id},function(err,posts){
		if(err)
			console.log(err);
		else{
			
					console.log("Posts: "+posts);
					res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id});	
			
		}
	
	});
	
};		

module.exports.postQue = function(req,res){
	var discussion_id = req.param('id');
	var newQue = new Question({
		discussion_id : discussion_id, 
		topic: req.body.topic,
		que_body : req.body.que,
		timeStamp: new Date(),
		user_id : req.user.id,
		fullname : req.user.fullname,
		profile_img	:	req.user.profile_img
	});
	//console.log(newQue);
	newQue.save(function(err, entryQue){
		if(err)
			console.log(err);
		else{
			Question.find({'discussion_id':discussion_id},function(err,posts){
				if(err)
					console.log(err);
				else{
					
							console.log("Posts: "+posts);
							res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id});	
					
				}
			
			});
		}	
	});
};

module.exports.postAns = function(req,res){
	var discussion_id = req.param('discussion_id');
	var ques_id = req.param('ques_id');
	console.log("___-- "+discussion_id+" "+ques_id+" ANsBODY: "+req.body.ansBody);
	var newAns = new Answer({
		discussion_id	:	discussion_id,
		que_id			:	ques_id,
		user_id			:	req.user.id,
		fullname		:	req.user.fullname,
		profile_img		:	req.user.profile_img,
		ans_body		:	req.body.ansBody
	});
	newAns.save(function(err,entryAns){
		if(err)
			console.log(err);
		else{
			Answer.find({'discussion_id':discussion_id},function(err,ans){
				if(err)
					console.log(err);
				else{
					console.log("Answers: "+ans);
					res.render('discussion',{answers : JSON.stringify(ans),discussion_id:discussion_id});	
				}
			
			});
			
		}
			
	});
	
};