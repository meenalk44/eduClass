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
	var template_discussion_A ='';
	var template_discussion_B = '';
	var template_rating_A = '';
	var template_rating_B = '';
	var currentUserSet = req.user.user_set;
	console.log("curr user set******** "+ currentUserSet);
    Class.findById(class_id)
        .exec(function (err, classInfo) {
            if (err)
                console.log(err);
            else {
                console.log(classInfo);
                template_discussion_A = classInfo.template_A.template_discussion;
                template_rating_A = classInfo.template_A.template_rating;

                template_discussion_B = classInfo.template_B.template_discussion;
                template_rating_B = classInfo.template_B.template_rating;
                if(currentUserSet == 'A')
                    discussionView(class_id, discussion_id, template_discussion_A, template_rating_A,req,res);
                else
                    discussionView(class_id, discussion_id, template_discussion_B, template_rating_B,req,res);
            }
        });
};

function discussionView(class_id, discussion_id, discussion_template, rating_template,req,res) {
    console.log("Discussion: "+ discussion_template);
    console.log("Rating: "+ rating_template);
    if (discussion_template === 'Flat') {
        Question.find({'discussion_id': discussion_id}).sort({'_id': -1})
            .exec(function (err, questions) {
                if (err)
                    console.log("ERR0a: " + err);
                else {
                    async.eachOf(questions,
                        function (que, index, callback) {
                            populateReplies(que)
                                .then(function (finalAnswer) {
                                    que.answers_level1 = finalAnswer;
                                    callback();
                                })
                                .catch(function (err) {
                                    res.send("ERR 0b: " + err);

                                })

                        },
                        function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render('flatDiscussion', {
                                    entries: questions,
                                    class_id: class_id,
                                    discussion_id: discussion_id,
                                    template: discussion_template,
                                    rating_template : rating_template
                                });
                            }

                        }
                    );
                }

            });
    } else {
        console.log("Nested posts");

        Question.find({'discussion_id': discussion_id}).sort({'_id': -1})
            .exec(function (err, questions) {
                if (err)
                    console.log("ERR0a: " + err);
                else {
                    async.eachOf(questions,
                        function (que, index, callback) {
                            populateReplies(que)
                                .then(function (finalAnswer) {
                                    que.answers_level1 = finalAnswer;
                                    callback();
                                })
                                .catch(function (err) {
                                    res.send("ERR 0b: " + err);

                                })

                        },
                        function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Nested answers : ==================\n"+ questions);
                                res.render('nestedDiscussion', {
                                    entries: questions,
                                    class_id: class_id,
                                    discussion_id: discussion_id,
                                    template: discussion_template,
                                    rating_template : rating_template
                                });
                            }

                        }
                    );
                }

            });

    }



};


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
                    if (que_details.answers_level1) {

                        async.eachOf(que_details.answers_level1,
                            function (currentAnswer, currentIndex, callback) {
                                deepPopulateReplies(currentAnswer)
                                    .then(function (modifiedCurrentAnswer) {
                                       /* console.log("\n\nCALLEE THEN");
                                        console.log("--------- modifiedCurrentAnswer");
                                        console.log(modifiedCurrentAnswer);
                                        console.log("---------");*/

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
                    } else {
                        //console.log("populate else");
                        return Promise.resolve(que_details.answers_level1);

                    }

                }

            });
    });


}

function deepPopulateReplies(currentAnswer) {
   /* console.log("\n\nMAIN DEEP POPULATE REPLIES");
    console.log("--------- currentAnswer");
    console.log(currentAnswer);
    console.log("---------");*/

    if (currentAnswer.replies) {

        return new Promise(function (resolve, reject) {
            async.eachOf(currentAnswer.replies,
                function (replyId, index, callback) {
                    /*console.log("\n\nASYNC EACH ITERATEE FUNCTION");
                    console.log("--------- replyId & index");
                    console.log(replyId);
                    console.log(index);
                    console.log("---------");*/

                    Answer.findById(replyId)
                        .exec()
                        .then(function (reply) {

                            /*console.log("\n\nANSWER findById THEN");
                            console.log("--------- reply");
                            console.log(reply);
                            console.log("---------");*/

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
                   /* console.log("\n\nASYNC EACH CALLBACK FUNCTION");
                    console.log("--------- err");
                    console.log(err);
                    console.log("---------");*/

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
		user_id : req.user._id,
		fullname : req.user.fullname,
		profile_img	:	req.user.profile_img,
        user_set    :   req.user.user_set
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
    var curr_rating_template = '';

    Class.findById(class_id, function (err, classInfo) {
        if (err)
            console.log(err);
        else {

            current_template = classInfo.template_discussion;
            curr_rating_template = classInfo.template_rating;
        }
        var time = new Date();
        time = time.toDateString();
        var newAns = new Answer({
            discussion_id: discussion_id,
            que_id: ques_id,
            user_id: req.user.id,
            fullname: req.user.fullname,
            profile_img: req.user.profile_img,
            user_set    :   req.user.user_set,
            ans_body: req.body.ansBody,
            ans_level: 1,
            timeStamp: time
        });
        newAns.save(function (err, ansEntry) {
            if (err)
                console.log(err);
            else {

                    Question.findByIdAndUpdate(ques_id, {$push:{answers_level1:ansEntry._id}}, function (err, que) {
                        if (err)
                            console.log(err);
                        else {
                            console.log("Updated question " + que);
                            console.log("Saved ans : "+newAns);
                            res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
                        }
                    });


            }
        });


    });
};


module.exports.postReply = function (req,res) {
    var discussion_id = req.param('discussion_id');
    var ques_id = req.param('ques_id');
    var class_id = req.param('class_id');
    var ans_id = req.param('ans_id');

    console.log("Reply: "+ ans_id);
    var time = new Date();
    time = time.toDateString();
    var newReply = new Answer({
        discussion_id: discussion_id,
        que_id: ques_id,
        user_id: req.user.id,
        fullname: req.user.fullname,
        profile_img: req.user.profile_img,
        user_set    :   req.user.user_set,
        ans_body: req.body.replyBody,
        timeStamp: time
    });
    newReply.save(function (err, replyEntry) {
        if (err)
            console.log(err);
        else {
            console.log("Reply entry: "+replyEntry);

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


module.exports.upvoteAnswer = function (req,res) {
    var class_id = req.param('class_id');
    var discussion_id = req.param('discussion_id');
    var answer_id = req.param('ans_id');
    var ratingTemplate = "";
    var numOfUpvotes = 0;
    var currUser = req.user.id;
    var currUserSet = req.user.user_set;

    Class.findById(class_id).exec(function (err,classResp) {
        if(err)
            console.log(err);
        else{
            if(currUserSet === 'A')
                ratingTemplate = classResp.template_A.template_rating;
            else
                ratingTemplate = classResp.template_B.template_rating;


            Answer.findById(answer_id).exec(function (err, ans) {
                if(err)
                    console.log(err);
                else{
                    var alreadyRated = 0;
                    async.each(ans.rating,
                        function (ratingObj,callback) {
                            if(ratingObj.rating_by == req.user.id){
                                alreadyRated = 1;
                            }
                            callback();

                        },
                        function (err) {
                            console.log("***************End for: "+alreadyRated);
                            if(alreadyRated == 1){
                                console.log("^^^^^^^^^^^SHOW ERROR");
                                //res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
                                res.render('error',{msg:"You have already rated this answer! You cannot rate again!",
                                    redirect:'/classes/'+class_id+'/discussion/'+discussion_id});

                            }else{
                                //numOfApproves = ans.rating_val;
                                numOfUpvotes = ans.num_of_upvotes;
                                if(numOfUpvotes == null)
                                    numOfUpvotes = 1;
                                else
                                    numOfUpvotes += 1;

                                var newRatingObj = {
                                    rating_type  : ratingTemplate,
                                    rating_by :   req.user.id

                                };

                                ans.rating.push(newRatingObj);
                                ans.num_of_upvotes = numOfUpvotes;
                                ans.save();
                                console.log("\n------ Updated Answer rating -------\n"+ans);
                                res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);

                            }
                        }
                    );
                }
            });
        }

    });


};

module.exports.downvoteAnswer = function (req,res) {
    var class_id = req.param('class_id');
    var discussion_id = req.param('discussion_id');
    var answer_id = req.param('ans_id');
    var ratingTemplate = "";
    var numOfApproves = 0;
    Class.findById(class_id).exec(function (err,classResp) {
        if(err)
            console.log(err);
        else{
            ratingTemplate = classResp.template_rating;


            Answer.findById(answer_id).exec(function (err, ans) {
                if(err)
                    console.log(err);
                else{
                    var alreadyRated = 0;
                    async.each(ans.rating, function (ratingObj,callback) {
                        if(ratingObj.rating_by == req.user.id){
                            alreadyRated = 1;
                            //callback();
                        }
                        callback();

                    },function (err) {
                        console.log("***************End for: "+alreadyRated);


                        if(alreadyRated == 1){
                            console.log("^^^^^^^^^^^SHOW ERROR");
                            //res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
                            res.render('error',{msg:"You have already rated this answer! You cannot rate again!",
                                redirect:'/classes/'+class_id+'/discussion/'+discussion_id});

                        }else{
                            numOfApproves = ans.rating_val;
                            if(numOfApproves == null)
                                numOfApproves = -1;
                            else
                                numOfApproves -= 1;

                            var newRatingObj = {
                                rating_type  : ratingTemplate,
                                rating_by :   req.user.id

                            };

                            ans.rating.push(newRatingObj);
                            ans.rating_val = numOfApproves;
                            ans.save();
                            console.log("\n------ Updated Answer rating -------\n"+ans);
                            res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);

                        }
                    });




                }



            });
        }

    });


};

module.exports.totalParticipation  = function (req,res) {
    var discussion_id = req.param('discussion_id');
    var totalNumOfStudents_A = 0, totalNumOfStudents_B = 0;
    var outputA = {}; var outputB = {};
    var studentIds = [], students_Set_A = [], students_Set_B = [];
    var class_name = '';
   // when user sets are not considered
   /* Class.findOne({'discussion_id':discussion_id}).exec(function (err,classEntry) {
        class_name = classEntry.class_name;
        totalNumOfStudents_A = classEntry.student_ids.length;
       async.each(classEntry.student_ids,
           function (stud_id, callback) {
               Answer.find({'discussion_id':discussion_id, 'user_id':stud_id        })
                   .exec(function (err,answersByUser) {
                      // console.log("Ans By User----------\n", answersByUser);
                       numOfPostsByUser = answersByUser.length;
                       console.log("Num of posts by "+ stud_id + " : "+ numOfPostsByUser);
                       var postEntry = {
                           student_id : stud_id,
                           numOfPosts : numOfPostsByUser
                       };
                       studentPostsCountArr.push(postEntry);
                       callback();
                   });
           },
           function (err) {
               if(err)
                    console.log(err);
               else{
                   console.log("Final Array===========\n"+ JSON.stringify(studentPostsCountArr));
                   async.series([
                       function (callbackA) {
                           Answer.find({'discussion_id':discussion_id}).exec(function (err,answerEntries) {
                               totalNumOfPosts = answerEntries.length;
                               console.log("Numof Posts"+ totalNumOfPosts);
                               console.log("Num of students" + totalNumOfStudents);
                               callbackA();
                           });

                       
                       },
                       function (callbackB) {
                           mean = totalNumOfPosts/totalNumOfStudents;
                           console.log("Mean "+ mean);
                           callbackB();
                       
                       }
                   ],
                   function (err,results) {
                       console.log("results ======\n"+results);

                       var sum = 0;
                       async.each(studentPostsCountArr,
                           function (arrEntry,callback1) {
                               sum += Math.pow(arrEntry.numOfPosts - mean,2);
                               console.log("Sum "+ sum);
                               callback1();
                           },
                           function (err) {
                               variance = sum/(totalNumOfStudents - 1);
                               console.log("Variance " + variance);
                               std_dev = (Math.sqrt(variance)).toFixed(2);
                               console.log("Std dev : "+ std_dev);
                               var value = 1.96*(std_dev/Math.sqrt(totalNumOfStudents - 1));
                               ci1 = (mean - value).toFixed(2);
                               ci2 = (mean + value).toFixed(2);
                               console.log("Confidence interval "+ ci1 + " to "+ ci2);
                               res.render('discussionAnalytics', {class_name:class_name ,ci1: ci1,ci2:ci2, mean:mean, std_dev:std_dev,variance:variance});


                           });
                       
                   });





               }
           }
       );



    });*/

//-------------------------------------------------code when user sets are considered
   Class.findOne({'discussion_id':discussion_id})
       .populate('student_ids')
        .exec(function (err, classEntry) {
        if(err)
            console.log(err);
        else{
            studentIds = classEntry.student_ids;
            console.log("Student_ids : "+ classEntry);

            students_Set_A = classEntry.student_ids.filter(function (stud_id) {
                return stud_id.user_set === 'A';

            });

            students_Set_B = classEntry.student_ids.filter(function (stud_id) {
                return stud_id.user_set === 'B';
            });


            class_name = classEntry.class_name;


            async.parallel([
                function (cbk) {
                    calculateConfidenceInterval(students_Set_A, discussion_id, students_Set_A.length,function (opA){
                        console.log("OUTPUT A:\n"+ JSON.stringify(opA));
                        outputA= opA;
                        cbk();
                        }
                    );


                },
                function (cbk) {
                    calculateConfidenceInterval(students_Set_B, discussion_id, students_Set_B.length,function (opB){
                        console.log("OUTPUT B:\n"+ JSON.stringify(opB));
                        outputB= opB;
                        cbk();
                        }
                    );

                }
            ],
                function (err) {
                    if(err)
                        console.log(err);
                    else{
                        console.log("-----------------------------------------------------------\n");
                        console.log("Set A: "+ JSON.stringify(outputA));
                        console.log("Set B: "+ JSON.stringify(outputB));
                        console.log("-----------------------------------------------------------\n");
                        //res.send("12345");
                        res.render('discussionAnalytics', {class_name:class_name ,
                            outputA: JSON.stringify(outputA),
                            outputB: JSON.stringify(outputB)
                        });

                    }

                }
            );







        }
    });

};

function calculateConfidenceInterval(student_ids, discussion_id, totalNumOfStudents, outputCb) {
    var totalNumOfPosts = 0, numOfPostsByUser = 0, mean = 0, std_dev =0, variance = 0, ci1=0, ci2 =0;
    var studentPostsCountArr = [];
    var numOfPostsByUser = 0;

    //Class.findOne({'discussion_id':discussion_id}).exec(function (err,classEntry) {

        async.each(student_ids,
            function (stud_id, callback) {
                Answer.find({'discussion_id':discussion_id, 'user_id':stud_id})
                    .exec(function (err,answersByUser) {
                        // console.log("Ans By User----------\n", answersByUser);
                        numOfPostsByUser = answersByUser.length;
                        console.log("Num of posts by "+ stud_id.id + " : "+ numOfPostsByUser);
                        var postEntry = {
                            student_id : stud_id,
                            numOfPosts : numOfPostsByUser
                        };
                        studentPostsCountArr.push(postEntry);
                        callback();
                    });
            },
            function (err) {
                if(err)
                    console.log(err);
                else{
                    //async.each(studentPostsCountArr,)
                    console.log("Final Array===========\n"+ studentPostsCountArr);
                    async.series([
                        function (cbkA) {
                            totalNumOfStudents = studentPostsCountArr.length;
                            async.each(studentPostsCountArr,function (entry,cbk1) {
                                totalNumOfPosts += entry.numOfPosts;
                                cbk1();

                            },function (err) {
                                mean = totalNumOfPosts/totalNumOfStudents;
                                cbkA();

                            });

                        },
                        function (cbkB) {

                            var sum = 0;
                            async.each(studentPostsCountArr,
                                function (arrEntry,callback1) {
                                    sum += Math.pow(arrEntry.numOfPosts - mean,2);

                                    callback1();
                                },
                                function (err) {
                                    console.log("Sum "+ sum);
                                    variance = sum/(totalNumOfStudents - 1);
                                    console.log("Variance " + variance);
                                    std_dev = (Math.sqrt(variance)).toFixed(2);
                                    //console.log("Std dev : "+ std_dev);
                                    var value = 1.96*(std_dev/Math.sqrt(totalNumOfStudents - 1));
                                    ci1 = (mean - value).toFixed(2);
                                    ci2 = (mean + value).toFixed(2);
                                    //console.log("Confidence interval "+ ci1 + " to "+ ci2);
                                    cbkB();
                                });
                        }
                    ],
                    function (err) {
                        var output = {
                            mean : mean,
                            std_dev: std_dev,
                            variance: variance,
                            ci1: ci1,
                            ci2: ci2
                        };
                        console.log("output=================================\n"+JSON.stringify(output));
                        outputCb(output);
                    });

                   
                }
            }
        );

};

