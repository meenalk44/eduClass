var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = Promise;
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Class = require('../models/classSchema');
var Question = require('../models/questionSchema');
var Answer = require('../models/answerSchema');
var async = require('async');

module.exports.dicussionShow = function(req, res){
	var discussion_id = req.param('id');
	var class_id = req.param('class_id');
	var current_template ='';
	console.log("Class_id: ", class_id);
	console.log("fetching data from mongo");
    Class.findById(class_id)
        .exec(function (err, classInfo) {
        if (err)
            console.log(err);
        else {
            console.log(classInfo);
            if (classInfo.template != 'Nested') {
                current_template = 'Flat';
            }
            else {
                current_template = 'Nested';
            }
                //console.log("Template: "+current_template);
                if(current_template === 'Flat'){
                    Question.find({'discussion_id':discussion_id}).sort({'_id':-1})
                        .populate([
                            {
                                path:'answers_level1',
                                model:'Answer'
                            }
                        ])
                       // .sort({'answers_level1._id':-1})
                        .exec(function (err,posts) {
                        if(err)
                            console.log(err);
                        else{
                            console.log("***Flat Posts: "+posts);
                            //var date = posts[0].answers_level1[0].timeStamp;
                           // console.log("time ",date.toDateString()+" "+ date.getDate()+"-" + date.getMonth()+"-" + date.getFullYear());
                            res.render('discussion',{entries:JSON.stringify(posts),class_id:class_id,discussion_id:discussion_id,template:current_template});

                        }

                    });

                }else{
                    console.log("Nested posts");

                    Question.find({'discussion_id':discussion_id})
                        .exec(function (err,questions) {
                        if(err)
                            console.log("ERR0a: "+err);
                        else{
                            async.eachOf(questions,
                                function (que, index, callback) {
                                    console.log("\n iteratee function");
                                    console.log("Que_id : "+que);
                                    populateReplies(que)
                                        .then(function (finalAnswer) {
                                            console.log("Final Answer-------");
                                            console.log(finalAnswer);
                                            //que.answers_level1 = finalAnswer;
                                            que.answers_level1 = finalAnswer;


                                            callback();
                                        })
                                        .catch(function(err){
                                            res.send("ERR 0b: "+err);

                                        })

                                    //console.log("\n iteratee function after callback");
                                },
                                function(err){
                                    if(err){
                                        console.log("End");
                                        console.log("\n after end");

                                    }else{
                                        console.log("else after end");
                                        // res.send(questions);
                                        res.render('discussion',{entries:JSON.parse(questions),class_id:class_id,discussion_id:discussion_id,template:current_template});
                                    }

                                }
                            );
                        }

                    });

                    function populateReplies(que) {

                        return new Promise(function (resolve, reject) {
                            Question.findById(que._id)
                                .populate([
                                    {
                                        path: 'answers_level1',
                                        model: 'Answer'
                                    }
                                ])
                                .exec(function (err, que_details) {
                                    if (err)
                                        res.send("ERROR1" + err);
                                    else {
                                        if(que_details.answers_level1){

                                            async.eachOf(que_details.answers_level1,
                                                function (currentAnswer, currentIndex, callback) {
                                                    deepPopulateReplies(currentAnswer)
                                                        .then(function (modifiedCurrentAnswer) {
                                                            console.log("\n\nCALLEE THEN");
                                                            console.log("--------- modifiedCurrentAnswer");
                                                            console.log(modifiedCurrentAnswer);
                                                            console.log("---------");

                                                            que_details.answers_level1[currentIndex] = modifiedCurrentAnswer;
                                                            callback();
                                                        })
                                                        .catch(function (err) {
                                                            res.send("ERROR2" + err);
                                                        })
                                                },
                                                function (err) {
                                                    if (err) {
                                                        //res.send("ERROR3" + err);
                                                        resject(err);
                                                    } else {
                                                        //res.send(question);
                                                        //que.answers_level1 = que_details;
                                                        resolve(que_details.answers_level1);
                                                    }
                                                }
                                            );
                                        }else{
                                            console.log("populate else");
                                            return Promise.resolve(que_details.answers_level1);

                                        }

                                    }

                                });
                        });



                    }

                    function deepPopulateReplies(currentAnswer) {
                        console.log("\n\nMAIN DEEP POPULATE REPLIES");
                        console.log("--------- currentAnswer");
                        console.log(currentAnswer);
                        console.log("---------");

                        if (currentAnswer.replies) {

                            return new Promise(function (resolve, reject) {
                                async.eachOf(currentAnswer.replies,
                                    function (replyId, index, callback) {
                                        console.log("\n\nASYNC EACH ITERATEE FUNCTION");
                                        console.log("--------- replyId & index");
                                        console.log(replyId);
                                        console.log(index);
                                        console.log("---------");

                                        Answer.findById(replyId)
                                            .exec()
                                            .then(function (reply) {

                                                console.log("\n\nANSWER findById THEN");
                                                console.log("--------- reply");
                                                console.log(reply);
                                                console.log("---------");

                                                deepPopulateReplies(reply)
                                                    .then(function (modifiedReply) {
                                                        currentAnswer.replies[index] = modifiedReply;
                                                        callback();
                                                    });
                                            })
                                            .catch(function (err) {
                                                callback(err);
                                            });
                                    },
                                    function (err) {
                                        console.log("\n\nASYNC EACH CALLBACK FUNCTION");
                                        console.log("--------- err");
                                        console.log(err);
                                        console.log("---------");

                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(currentAnswer);
                                        }
                                    }
                                );
                            });
                        } else {
                            //console.log("ELSE resolve promise");
                            return Promise.resolve(currentAnswer);
                        }

                    }

                }
        }
    });


	
};		

module.exports.postQue = function(req,res){
	var discussion_id = req.param('id');
	var class_id = req.param('class_id');
    var time = new Date();
    time = time.toDateString();

	var newQue = new Question({
		discussion_id : discussion_id, 
		topic: req.body.topic,
		que_body : req.body.que,
		timeStamp: time,
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
        var time = new Date();
        time = time.toDateString();
        var newAns = new Answer({
            discussion_id: discussion_id,
            que_id: ques_id,
            user_id: req.user.id,
            fullname: req.user.fullname,
            profile_img: req.user.profile_img,
            ans_body: req.body.ansBody,
            ans_level: 1,
            timeStamp: time
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


module.exports.test = function (req,res) {

    Question.find({discussion_id:'58ce07d8dd449a20b4f02d22'}).exec(function (err,questions) {
        if(err)
            console.log("ERR0aa: "+err);
        else{
            async.eachOf(questions,
                function (que, index, callback) {
                    console.log("\n iteratee function");
                    console.log("Que_id : "+que);
                    populateReplies(que)
                        .then(function (finalAnswer) {
                            console.log("Final Answer-------");

                            //que.answers_level1 = finalAnswer;
                            que.answers_level1 = finalAnswer;
                            console.log(finalAnswer);
                            console.log("\n---\n"+que);


                            callback();
                        })
                        .catch(function(err){
                            console.log("ERROR----------\n");
                            //console.log(finalAnswer);
                            res.send("ERR 0b: "+err);

                    })

                    //console.log("\n iteratee function after callback");
                },
                function(err){
                    if(err){
                        console.log("End");
                        console.log("\n after end");

                    }else{
                        console.log("else after end");
                        res.send(questions);
                        //res.render('discussion',{entries:JSON.parse(questions),class_id:class_id,discussion_id:discussion_id,template:current_template});
                    }

                }
            );
        }

    });

    function populateReplies(que) {

            return new Promise(function (resolve, reject) {
                Question.findById(que._id)
                    .populate([
                        {
                            path: 'answers_level1',
                            model: 'Answer'
                        }
                    ])
                    .exec(function (err, que_details) {
                        if (err)
                            res.send("ERROR1" + err);
                        else {
                            if(que_details.answers_level1){

                                async.eachOf(que_details.answers_level1,
                                    function (currentAnswer, currentIndex, callback) {
                                        deepPopulateReplies(currentAnswer)
                                            .then(function (modifiedCurrentAnswer) {
                                                console.log("\n\nCALLEE THEN");
                                                console.log("--------- modifiedCurrentAnswer");
                                                console.log(modifiedCurrentAnswer);
                                                console.log("---------");

                                                que_details.answers_level1[currentIndex] = modifiedCurrentAnswer;
                                                callback();
                                            })
                                            .catch(function (err) {
                                                res.send("ERROR2" + err);
                                            })
                                    },
                                    function (err) {
                                        if (err) {
                                            //res.send("ERROR3" + err);
                                            reject(err);
                                        } else {
                                            //res.send(question);
                                            //que.answers_level1 = que_details;
                                            console.log("--Before resolving \n",que_details.answers_level1);
                                            resolve(que_details.answers_level1);
                                        }
                                    }
                                );
                            }else{
                                console.log("--Before resolving in else\n",que_details.answers_level1);
                                return Promise.resolve(que_details.answers_level1);

                            }

                        }

                    });
            });



    }

    function deepPopulateReplies(currentAnswer) {
        console.log("\n\nMAIN DEEP POPULATE REPLIES");
        console.log("--------- currentAnswer");
        console.log(currentAnswer);
        console.log("---------");

        if (currentAnswer.replies) {

            return new Promise(function (resolve, reject) {
                async.eachOf(currentAnswer.replies,
                    function (replyId, index, callback) {
                        console.log("\n\nASYNC EACH ITERATEE FUNCTION");
                        console.log("--------- replyId & index");
                        console.log(replyId);
                        console.log(index);
                        console.log("---------");

                        Answer.findById(replyId)
                            .exec()
                            .then(function (reply) {

                                console.log("\n\nANSWER findById THEN");
                                console.log("--------- reply");
                                console.log(reply);
                                console.log("---------");

                                deepPopulateReplies(reply)
                                    .then(function (modifiedReply) {
                                        currentAnswer.replies[index] = modifiedReply;
                                        callback();
                                    });
                            })
                            .catch(function (err) {
                                callback(err);
                            });
                    },
                    function (err) {
                        console.log("\n\nASYNC EACH CALLBACK FUNCTION");
                        console.log("--------- err");
                        console.log(err);
                        console.log("---------");

                        if (err) {
                            reject(err);
                        } else {
                            resolve(currentAnswer);
                        }
                    }
                );
            });
        } else {
            //console.log("ELSE resolve promise");
            return Promise.resolve(currentAnswer);
        }

    }

};

