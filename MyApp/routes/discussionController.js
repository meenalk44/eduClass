var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Class = require('../models/classSchema');
var Question = require('../models/questionSchema');
var Answer = require('../models/answerSchema');
//var Reply = require('../models/replySchema');

module.exports.dicussionShow = function(req, res){
	var discussion_id = req.param('id');
	var class_id = req.param('class_id');
	var current_template ='';
	console.log("fetching data from mongo");
    Class.findById(class_id, function (err, classInfo) {
        if (err)
            console.log(err);
        else {
            if (classInfo.template != 'Nested') {
                current_template = 'Flat';
                console.log("___!!! "+current_template);
            } else{
                current_template = 'Nested';
                console.log("*** !!! "+current_template);
            }
        }
    });
    if(current_template === 'Flat'){
        /*Question.find({'discussion_id':discussion_id}).sort({'_id':-1})
            .populate('answers_level1').exec(function(err,posts){
            if(err)
                console.log(err);
            else{
                console.log("Posts: "+posts);
                res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id, class_id:class_id,template:current_template});
            }

        });*/
        Answer.find({'discussion_id':discussion_id}).sort({'_id':-1})
            .populate([
                {
                    path    :   'que_id',
                    model   :   'Question',
                    populate:{
                        path:'question',
                        model:'Question'
                    }
                },
                {
                    path    :   'answers_level1',
                    model   :   'Answer',
                    populate:{
                        path:'question',
                        model:'Question',
                        populate:{
                            path:'answer',
                            model:'Answer'
                        }
                    }
                }
            ]).exec(function (err,posts) {
                if(err)
                    console.log(err);
                else{
                    console.log("***Flat Posts: "+posts);
                    res.send(posts);

                }

        });

    }else{
        Answer.find({'discussion_id':discussion_id}).sort({'_id':-1})
            .populate([
                {
                    path    :   'que_id',
                    model   :   'Question',
                    populate:{
                        path:'question',
                        model:'Question'
                    }
                },
                {
                    path    :   'replies',
                    model   :   'Answer',
                    populate:{
                        path:'answer',
                        model:'Answer'
                    }
                }
            ]).exec(function (err,posts) {
                if(err)
                    console.log(err);
                else {
                    console.log("Nested Posts:"+posts);
                    //res.send(posts);
                    res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id, class_id:class_id,template:current_template});
                }

        });
    }

	
};		

module.exports.postQue = function(req,res){
	var discussion_id = req.param('id');
	var class_id = req.param('class_id');
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
			Question.find({'discussion_id':discussion_id}).sort({'_id':-1}).exec(function(err,posts){
				if(err)
					console.log(err);
				else{
					console.log("Posts: "+posts);
					res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
				}
			});
		}	
	});
};


module.exports.postAns = function (req,res) {
    var discussion_id = req.param('discussion_id');
    var ques_id = req.param('ques_id');
    var class_id = req.param('class_id');
    var current_template = '';

    Class.findById(class_id, function (err, classInfo) {
        if (err)
            console.log(err);
        else {
            if (classInfo.template != 'Nested') {
                current_template = 'Flat';
            } else current_template = 'Nested';
        }

        var newAns = new Answer({
            discussion_id: discussion_id,
            que_id: ques_id,
            user_id: req.user.id,
            fullname: req.user.fullname,
            profile_img: req.user.profile_img,
            ans_body: req.body.ansBody,
            ans_level: 1,
            timeStamp: new Date()
        });
        newAns.save(function (err, ansEntry) {
            if (err)
                console.log(err);
            else {
               // if (current_template == 'Flat') {

                    Question.findByIdAndUpdate(ques_id, {$push:{answers_level1:ansEntry._id}}, function (err, que) {
                        if (err)
                            console.log(err);
                        else {
                            console.log("Updated question " + que);
                            console.log("Saved ans : "+newAns);
                            res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
                        }
                    });
              //  }

            }
        });


    });
};


module.exports.postReply = function (req,res) {
    var discussion_id = req.param('discussion_id');
    var ques_id = req.param('ques_id');
    var class_id = req.param('class_id');
    var ans_id = req.param('ans_id');
    var current_template = '';
    console.log("Reply: "+ ans_id);
    /*var newReply = new Reply({
        //discussion_id: discussion_id,
        //que_id: ques_id,
        ans_id: ans_id,
        user_id: req.user.id,
        fullname: req.user.fullname,
        profile_img: req.user.profile_img,
        reply_body: req.body.replyBody,
        timeStamp: new Date()
    });*/
    var newReply = new Answer({
        discussion_id: discussion_id,
        que_id: ques_id,
        //ans_id: ans_id,
        user_id: req.user.id,
        fullname: req.user.fullname,
        profile_img: req.user.profile_img,
        ans_body: req.body.replyBody,
        timeStamp: new Date()
    });
    newReply.save(function (err, replyEntry) {
        if (err)
            console.log(err);
        else {
            console.log("Reply entry: "+replyEntry);
            //Answer.findByIdAndUpdate(ans_id, {$push:{replies:ansEntry._id}}, function (err, updAns) {
            Answer.update({'_id':ans_id},
                {$push:{'replies':replyEntry._id}},function(err,updAns){
                if (err)
                    console.log(err);
                else {
                    console.log("updAns "+updAns);
                    res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
                }
            });


        }
    });
};


/*
using mongoose-tree2

module.exports.postAns = function(req,res){
	var discussion_id = req.param('discussion_id');
	var ques_id = req.param('ques_id');
	var class_id = req.param('class_id');
	var current_template = '';
	var que_entry ={};
	Class.findById(class_id,function (err, classInfo) {
		if(err)
			console.log(err);
		else{
			if (classInfo.template != 'Nested') {
                current_template = 'Flat';
            } else current_template = 'Nested';
		}

        var newAns = new Answer({
            discussion_id	:	discussion_id,
            que_id			:	ques_id,
            user_id			:	req.user.id,
            fullname		:	req.user.fullname,
            profile_img		:	req.user.profile_img,
            ans_body		:	req.body.ansBody
        });
        if(current_template == 'Flat') {

            Question.findById(ques_id, function (err, que) {
                if (err)
                    console.log(err);
                else {
                    console.log("Found question " + que);
                    newAns.parent = que;
                    que_entry = que;
                    console.log("$$$$ "+que_entry);
                    console.log("$$@@ "+ newAns);
                    que_entry.save(function (err,savedQue) {
                        if(err)
                            console.log(err);
                        else{
                            console.log("After save  "+savedQue);
                            newAns.save(function (err, entryAns) {
                                if (err)
                                    console.log(err);
                                else {
                                    console.log(entryAns);
                                    console.log(newAns.level);

									/* Question.findById(ques_id, function (err, que) {
									 if (err)
									 console.log(err);
									 else {
                                    savedQue.getChildren(true, function (err, quetree) {
                                        console.log("---- : "+quetree);
                                        //res.send(quetree);
                                    });
                                    var args = {
                                        recursive:true,
                                        emptyChilds: true
                                    }
                                    savedQue.getChildrenTree(args, function (err, ct) {
                                        console.log("**-- " + ct);

                                    });
                                    newAns.getAncestors(function (err, ansChildren) {
                                        console.log("* " + ansChildren);

                                    });*//*

                                }
                            });

                        }
                    });
                }

            });


        }

    });

};
*/
