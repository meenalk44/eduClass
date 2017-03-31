//var mongoose = require('mongoose');
var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = Promise;
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Class = require('../models/classSchema');
var Question = require('../models/questionSchema');
var Answer = require('../models/answerSchema');
var async = require('async');

//var Promise = require('bluebird');
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
                            res.send(posts);
                            //res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id, class_id:class_id,template:current_template});
                        }

                    });
                }

            }
        }
    });


	
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

module.exports.test = function(req,res) {

    Question.findById("58d45eab951781181c7606ef")
        // .sort({'_id':-1})
        .populate([
            {
                path    :   'answers_level1',
                model   :   'Answer'
            }
        ])
        .exec(function(err,questions){
            if(err)
                console.log(err);
            else{

                // async.eachOf(questions.answers_level1,
                //     function (ans, index, callback) {
                        populateComments(questions.answers_level1[0])
                            .then(function (currentAnsReplies) {
                                ans.replies = currentAnsReplies;
                                // console.log(currentAnsReplies);
                                questions.answers_level1[index] = ans;
                                // callback()
                            })
                            .catch(function (err) {
                                // callback(err);
                            });
                    // },
                    // function (err) {
                        // console.log("MAIN");
                        // console.log(questions.answers_level1[0]);
                    // }
                // );

            }
        });

    function populateComments(ans) {
        console.log("\n\nMAIN POPULATE COMMENTS\n\n", ans);
        if (ans.replies) {

            return new Promise(function (resolve, reject) {
                async.eachOf(ans.replies,
                    function (replyId, index, callback) {
                        console.log("START");
                        console.log(replyId);
                        console.log(index);
                        console.log("END");

                        Answer.findById(replyId)
                            .exec()
                            .then(function (reply) {
                                console.log("Tanmay", reply);
                                populateComments(reply)
                                    .then(function (response) {
                                        console.log("Patil of ", response);
                                        ans.replies[index] = response;

                                        callback(null, ans);
                                    });
                            })
                            .catch(function (err) {
                                callback(err);
                            });
                    },
                    function (err, ans) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(ans);
                        }
                    }
                );
            });

        } else {
            return Promise.resolve({a: 1});
        }
    }


};

        /*Answer.findById(repl).sort({'_id':-1})
            .populate([
                {
                    path:'replies',
                    model:'Answer'
                }
            ])
            .exec()
            .then(function (popReply) {
                if(popReply.replies == null){
                    output = popReply;
                    console.log("---**^^ "+popReply);
                    return Promise.resolve(output);

                }else{
                    populateComments(popReply);
                }
                return Promise.resolve(output);

            }).catch(function () {
                console.log("promise rejected");
            });*/

 /*   Question.findById("58d45eab951781181c7606ef").sort({'_id':-1})
        .populate([
            {
                path    :   'answers_level1',
                model   :   'Answer',
                populate:{
                    path:'replies',
                    model:'Answer',
                    populate:{
                        path:'replies',
                        model:'Answer'
                    }
                }

            }
        ]).exec(function(err,questions){
        if(err)
            console.log(err);
        else{
            questions.answers_level1.forEach(function (ans) {
                console.log(JSON.stringify(ans.replies));
                if(ans.replies) {
                    populateComments(ans.replies).then(function (rep) {
                        console.log("after pop "+ rep);


                    },function () {
                        console.log("rejected");
                    });
                   console.log(":::: "+ JSON.stringify(ans.replies));
                   //var rep = ans.replies;
                   //var doc = rep.populate('replies').populate({path:'replies',model:'Answer'}).execPopulate();
                   //doc.then();
                    Question.findById(ans.replies.replies).sort({'_id':-1})
                        .populate([
                            {

                                    path:'replies',
                                    model:'Answer'


                            }
                        ]).exec(function(err,que) {
                        if (err)
                            console.log(err);
                        else {
                            console.log("8888    **  "+que);
                        }
                    });


                }
            });
            res.send(questions);
        }
    });

    function populateComments(repl) {
        console.log("REPL! "+repl);
        console.log("REPL: "+repl.replies);
        Question.populate(repl,[
            {
                path:'replies'

            }
        ]).then(function (popReply) {
            return Promise.fulfilled(popReply);
        },function () {
            console.log("promise rejected");
        });


    }


};*/
    /*
    Question.findById("58d45eab951781181c7606ef").sort({'_id':-1})
        .populate([

            {
                path    :   'answers_level1',
                model   :   'Answer'

            }
        ]).exec(function(err,questions){
        if(err)
            console.log(err);
        else{
            // console.log("Posts: "+questions);
            questions.answers_level1.forEach(function (ans) {
                ans.deepPopulate('replies',function (err,_ans) {
                    console.log("-------");
                    console.log(_ans.replies);
                    console.log("-------");
                })

            });
            res.send(questions);
            //res.send(questions);
            //res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id, class_id:class_id,template:current_template});
        }

    });
*/

    // var newReply = new Answer({
    //     discussion_id:'58ce07d8dd449a20b4f02d22',
    //     que_id: '58d45eab951781181c7606ef',
    //     //ans_id: ans_id,
    //     //user_id: req.user.id,
    //     //fullname: req.user.fullname,
    //     //profile_img: req.user.profile_img,
    //     ans_body: 'ABCSD2',
    //     timeStamp: new Date()
    // });
    // newReply.save(function (err, replyEntry) {
    //     if (err)
    //         console.log(err);
    //     else {
    //         console.log("Reply entry: "+replyEntry);
    //         //Answer.findByIdAndUpdate(ans_id, {$push:{replies:ansEntry._id}}, function (err, updAns) {
    //         Answer.update({'_id':'58d5b78e01061402a44b7169'},
    //             {$push:{'replies':replyEntry._id}},function(err,updAns){
    //                 if (err)
    //                     console.log(err);
    //                 else {
    //                     console.log("updAns "+updAns);
    //                     res.send(updAns);
    //                     //res.redirect('/classes/'+class_id+'/discussion/'+discussion_id);
    //                 }
    //             });
    //
    //
    //     }
    // });
/*
var rep ={};
var searchReply = Question.findById("58d45eab951781181c7606ef").sort({'_id':-1})
                            .populate([
                                {
                                    path: 'answers_level1',
                                    model: 'Answer'
                                }])
        .exec(function (err, reply) {
                if(err)
                    console.log(err)
                else {
                    //searchReplyrep = repl;
                    //res.send(reply);
                    reply.answers_level1.forEach(function (ans) {
                        console.log("____---- " + JSON.stringify(ans.replies));
                        populateReplies(JSON.stringify(ans.replies)).then(function () {
                            console.log("Mil gaya : " + ans.replies);


                        });
                    })
                    repl.answers_level1.forEach(function (ans) {
                        console.log("****R " + ans.replies);
                        rep = ans.replies;
                        console.log(ans.replies[0].replies);
                        ans.replies.id.populate('replies').exec(function (err,moreRep) {
                            console.log("---*** "+moreRep);

                        });
                        populateReplies(rep).then(function () {
                            console.log("Mil gaya"+rep );
                            
                        });

                    })
                }
            });

        function populateReplies(replyDoc) {
        console.log(JSON.stringify(replyDoc));
        return Question.findById(JSON.stringify(replyDoc)).populate('answers_level1').then(function (rep) {
            //res.send(reply);
            console.log("----- "+rep);
            console.log("____ "+ JSON.stringify(repl.answers_level1.replies));
            return rep.answers_level1 ? populateReplies(rep.answers_level1) : Promise.fulfilled(rep.answers_level1);
        });

    }
*/

    /*var repl = function (searchReply, rep, cb) {
        var reqdrep = searchReply.replies.id(rep);
        if(reqdrep == undefined){
            _.each(searchReply.rep, function(nextRep){
                repl(nextRep, rep, cb);
            }.bind(this))
        }else {
            cb(reqdrep);
        }
    }*/






/*
     Question.findById("58d45eab951781181c7606ef").sort({'_id':-1})
        .populate([
            {
                path    :   'answers_level1',
                model   :   'Answer',
                populate:{
                    path:'replies',
                    model:'Answer',
                    populate:{
                        path:'answer',
                        model:'Answer'
                    }
                }
            }
        ]).exec(function(err,repl){
        if(err)
            console.log(err);
        else{
            //console.log("Posts: "+questions);
            console.log("*** "+repl);
            populateReplies(repl).then(function () {
                res.send(repl);
                
            });

            //res.render('discussion',{entries : JSON.stringify(posts),discussion_id:discussion_id, class_id:class_id,template:current_template});
        }

    });

    function populateReplies(repl) {
        if(repl.answers_level1.replies!=null) {
            return repl.populate({
                path: 'replies',
                model: 'Answer',
                populate: {
                    path: "answer",
                    model: "Answer"
                }
            }).exec(function (err,repl) {
                return repl ? populateReplies(repl) : Promise.fulfill(repl);
            });
        }else{
            console.log("Not found!!");
        }

    }

    Answer.findById("58d45eb5951781181c7606f0").populate('replies').exec(function (err,ans) {
        if(err)
            console.log(err);
        else{
            res.send(ans);
        }



    });

};
*/
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
