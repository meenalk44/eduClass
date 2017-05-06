var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Quiz = require('../models/quizSchema');
var async = require('async');
var Promise = require('bluebird');
var QuizResponse = require('../models/quizResponseSchema');


module.exports.quizSettings = function(req, res){
	var class_id = req.param('class_id');
    Quiz.find({'class_id':class_id}).exec(function (err,quizzes) {
        if (err)
            console.log(err);
        else {
            res.render('quizSettings', {quizzes:JSON.stringify(quizzes),'class_id': class_id});
        }
    });
};

module.exports.createQuiz = function (req,res) {

    var class_id = req.param('class_id');
    var ques_arr = [];
    var marks_arr = [];
    var numOfQues = Object.keys(req.body).length;
    var time = new Date();
    time = time.toDateString();
    var newQue ={};
    var marks = {};
    //var pro = new Promise(function(resolve,reject{
    var cnt = 0;
    var quiz_name = "";
    console.log("req body "+JSON.stringify(req.body));
    async.each(Object.keys(req.body), function (prop,callback) {
        //console.log(prop);
        if(prop == "quiz_name"){
            quiz_name = req.body[prop];
        }else{
            if (req.body.hasOwnProperty(prop)) {
                if(prop.search("textbox")>=0){
                    newQue ={
                        que_num: cnt,
                        que_body: req.body[prop]
                    };
                    ques_arr[cnt] = newQue;

                }else{
                    marks = {
                        que_num: cnt,
                        max_marks:req.body[prop]
                    };
                    marks_arr[cnt] = marks;
                    cnt = cnt + 1;
                }

            }
        }


        callback();
    },function (err) {
        if(err)
            res.send("ERR in ASYNC"+err);
        else{
            /*console.log("--- "+ JSON.stringify(ques_arr));
            console.log("-*-*- "+ JSON.stringify(marks_arr));
            console.log("--ASYNC-- "+ JSON.stringify(ques_arr));*/
            var newQuiz = new Quiz({
                quiz_name : quiz_name,
                class_id: class_id,
                timestamp: time,
                user_id: req.user.id,
                fullname: req.user.fullname,
                profile_img : req.user.profile_img,
                questions : ques_arr,
                marks   :   marks_arr

             });
            console.log("**** "+ newQuiz);
            newQuiz.save(function(err, quiz){
                 if(err)
                    console.log(err);
                 else{
                    console.log("Quiz: "+quiz);
                    res.render('previewQuiz',{entries:JSON.stringify(quiz),class_id:class_id});

                 }
             });
        }

    });



};

module.exports.availableQuizzes = function (req,res) {
    var class_id = req.param('class_id');
    var show_arr = [];
    var dont_show_arr = [];

    var currUserID = req.user.id;
    Quiz.find({'class_id':class_id}).exec(function (err,quizzes) {
        if(err)
            console.log(err);
        else{
            show_arr = quizzes.filter(function (quiz) {
               return quiz.quizTakenBy.indexOf(currUserID) < 0;
            });
            dont_show_arr = quizzes.filter(function (quiz) {
                return quiz.quizTakenBy.indexOf(currUserID) >= 0;
            });
            res.render('availableQuizzes',{quizzesNotTaken:JSON.stringify(show_arr),quizzesTaken : JSON.stringify(dont_show_arr)});
            }
    });

};

module.exports.takeQuiz = function (req,res) {

    var quiz_id = req.param('quiz_id');
    console.log(quiz_id);
    var student_id = req.param('user_id');
    Quiz.findById(quiz_id).exec(function (err,quiz) {
        if(err)
            console.log(err);
        else {
            console.log("++++  :\n"+quiz);
            res.render('takeQuiz',{quiz:JSON.stringify(quiz),quiz_id:quiz_id, student_id:student_id});
        }

    });



};

module.exports.storeQuizResponse = function (req,res) {
    var quiz_id = req.param('quiz_id');
    var quiz_name = req.param('quiz_name');
    console.log(quiz_name);
    var class_id = req.param('class_id');
    var time = new Date();
    time = time.toDateString();
    var newAns = {};
    var cnt =0;
    var ans_arr = [];
    //console.log("storeQuizResponse------------------\n"+JSON.stringify(req.body.ans));
    async.each(req.body.ans,
        function (answer,callback) {
            //console.log("Req.body--\n"+ answer);
            newAns ={
                que_num: cnt,
                ans_body: answer
            };
            ans_arr[cnt] = newAns;
            cnt++;
            callback();


    },function (err) {
        //console.log("End of for loop");
        var newQuizResp = new QuizResponse({
            quiz_name:quiz_name,
            class_id: class_id,
            quiz_id: quiz_id,
            status: 'COMPLETED',
            timestamp: time,
            user_id: req.user.id,
            fullname: req.user.fullname,
            profile_img : req.user.profile_img,
            user_set : req.user.user_set,
            answers : ans_arr
        });
        newQuizResp.save(function (err,quizResp) {
            if(err)
                console.log(err);
            else{
                console.log("Saved Ans:-----\n"+quizResp);
                Quiz.update({'_id':quizResp.quiz_id},{$push:{'quizTakenBy':req.user.id}},
                    function(err,updatedEntry){
                    if(err)
                        console.log(err);
                    else{
                        console.log("Studs:===\n"+ JSON.stringify(updatedEntry));
                        res.render('success',{msg:'Quiz has been submitted successfully!',redirect:'/classes'});
                    }

                });

            }

        });

    });



};

module.exports.renderEvaluate = function (req,res) {
    var quiz_id = req.param('quiz_id');
    var toEvaluate = [];
    Quiz.findById(quiz_id)
        .populate('quizTakenBy')
        .exec(function (err, quiz) {
        if(err)
            console.log(err);
        else{
            console.log("Quiz**** \n"+quiz);
            var arrayOfResponses = [];
            async.each(quiz.quizTakenBy, function (takenBy, callback) {
                console.log("===");
                console.log(takenBy);
                console.log("===");

                QuizResponse.findOne({'quiz_id':quiz_id, 'user_id': takenBy._id})
                    .exec(function (err, response) {
                        if(err) {
                            console.log(err);
                        } else {
                            if(response.status === "COMPLETED") {
                                arrayOfResponses.push(takenBy);
                            }
                        }
                        callback();
                    });
            }, function (err) {
                 res.render('evalAllTable',{
                     completed: JSON.stringify(arrayOfResponses),
                     quiz_id:quiz_id
                 });

            });
        }
    });

};

module.exports.evalStudentResp = function (req,res) {
    var quiz_id = req.param('quiz_id');
    var student_id = req.param('student_id');

    QuizResponse.find({'quiz_id':quiz_id, 'user_id':student_id})
        .populate([
            {
                path:'quiz_id',
                model:'Quiz'
            }
        ])
        .exec(function (err,solvedQuizzes) {
            if(err)
                console.log(err);
            else{
                console.log("Solved------\n"+solvedQuizzes);
                res.render('evalIndividualResp',{solvedQuizzes:JSON.stringify(solvedQuizzes)});
            }

        })


};

module.exports.storeScores = function (req,res) {
    var quiz_id = req.param('quiz_id');
    var quizResp_id = req.param('quizResp_id');
    var student_id = req.param('student_id');

    var totalObtd =0, total  =0;
    var marksObtd = req.body.marks;
    var totalMarks = req.body.max_marks;
    marksObtd.forEach(function(marks){
        totalObtd += parseInt(marks);

    });
    totalMarks.forEach(function (tot) {
        total += parseInt(tot);

    });

    console.log("Question-------------\n");
    QuizResponse.findOne({'_id':quizResp_id}).exec(function (err,doc) {
        console.log(doc.answers[0]);
        console.log("Req body-------\n"+ JSON.stringify(req.body));
        var marks = {};
        var marks_arr = [];
        var percentage = (totalObtd / total)* 100;
        async.eachOf(req.body.marks, function (score,index,callback) {
            console.log("score-----: "+ score);
            marks = {
                que_num: index,
                marks_scored: score
            };
            marks_arr[index] = marks;
            callback();
        },function (err) {
            if(err)
                res.send("ERR in ASYNC"+err);
            else {
                console.log("marks_arr====== "+JSON.stringify(marks_arr));
                doc.marks = marks_arr;
                doc.status = "GRADED";
                doc.marks_obtd = totalObtd;
                doc.total_marks = total;
                doc.percent_marks = percentage.toFixed(2);
                doc.save();
                res.render('success', {msg: 'Quiz has been evaluated!', redirect: '/classes'});
            }
        });
    });

};

module.exports.viewResults = function (req,res) {
    var quiz_id = req.param('quiz_id');
    QuizResponse.find({'quiz_id':quiz_id}).exec(function (err,responses) {
        if(err)
            console.log(err);
        else{
            console.log(responses);
            res.render('viewResults',{responses:JSON.stringify(responses)});
        }

    })

};

module.exports.showScore = function (req,res) {
    var class_id = req.param('class_id');
    QuizResponse.find({'class_id':class_id,'user_id':req.user.id}).exec(function (err,solvedQuizzes) {
        if(err)
            console.log(err);
        else{
            console.log("-------showScore\n"+solvedQuizzes);
            //res.send(solvedQuizzes);
            res.render('studentScores',{solvedQuizzes:JSON.stringify(solvedQuizzes)});
        }

    });

};

module.exports.showAnalytics = function (req,res) {
    var quiz_id = req.param('quiz_id');
    var marks_obtd = [];
    var marks_obtdB = [];
    var sum =0, sum1 = 0, mean =0, variance=0, std_deviation=0;
    var sample_size = 0, ci1 = 0, ci2 = 0, value = 0;
    var sumB =0, sum1B = 0, meanB =0, varianceB=0, std_deviationB=0;
    var sample_sizeB = 0, ci1B = 0, ci2B = 0, valueB = 0;
    var z = 1.96;
    var quizResps ={}; var quizName = '';
    async.parallel([

            function (cbk) {
                // function for user_set A
                QuizResponse.find({'quiz_id':quiz_id,'user_set':'A'})
                    .exec(function(err,responses){
                        if(err)
                            console.log(err);
                        else{
                            quizResps = responses;
                            quizName = quizResps[0].quiz_name;
                            console.log("QuizResponse=========\n "+ quizResps[0].quiz_name);
                            sample_size = responses.length;
                            console.log("Marks:---\n"+ responses.length);
                            async.series([function (callback1) {
                                        async.eachOf(responses,
                                            function (quizResp, index, callback11) {
                                                console.log("Marks:---\n"+ quizResp.percent_marks);
                                                marks_obtd[index] = quizResp.percent_marks;
                                                sum += quizResp.percent_marks;
                                                callback11();

                                            },
                                            function (err) {
                                                console.log("End of loop " + sum);
                                                //var sample_size = marks_obtd.length;
                                                mean = sum/(sample_size);
                                                console.log("Mean ---- : "+mean);
                                                //res.send(marks_obtd);
                                                callback1();
                                            }
                                        );


                                    }
                                        ,function (callback2) {
                                        async.eachOf(responses,
                                            function (quizResp, index, callback22) {
                                                console.log("Marks:---\n"+ quizResp.percent_marks);
                                                sum1 += Math.pow(quizResp.percent_marks - mean, 2);
                                                callback22();

                                            },
                                            function (err) {
                                                console.log("End of loop " + sum1);
                                                //var sample_size = responses.length;
                                                variance = sum1/(sample_size - 1);
                                                //res.send(marks_obtd);
                                                callback2();
                                            }
                                        );
                                    }]
                                ,function(err){
                                    if(err)
                                        console.log(err);
                                    else{
                                        std_deviation = (Math.sqrt(variance)).toFixed(2);
                                        console.log("Standard dev: "+ std_deviation);
                                        console.log("Variance  :" + variance);
                                        value  = z * (std_deviation/Math.sqrt(sample_size - 1));
                                        ci1 = (mean - value).toFixed(2);
                                        ci2 = (mean + value).toFixed(2);
                                        console.log("Confidence Interval :" + ci1 + " to " + ci2);
                                        //res.render('showAnalyticsResult',{quiz_name:responses[0].quiz_name ,ci1: ci1,ci2:ci2, mean:mean, std_dev:std_deviation,variance:variance});
                                    }
                                    cbk();
                                }
                            );




                        }

                    });


            },
            function (cbk) {
                // function for user set B
                QuizResponse.find({'quiz_id':quiz_id,'user_set':'B'})
                    .exec(function(err,responses) {
                        if (err)
                            console.log(err);
                        else {
                            console.log("QuizResponse=========\n " + responses);
                            sample_sizeB = responses.length;
                            console.log("Marks:---\n" + responses.length);
                            async.series([function (callback1) {
                                        async.eachOf(responses,
                                            function (quizResp, index, callback11) {
                                                console.log("Marks:---\n" + quizResp.percent_marks);
                                                marks_obtdB[index] = quizResp.percent_marks;
                                                sumB += quizResp.percent_marks;
                                                callback11();

                                            },
                                            function (err) {
                                                console.log("End of loop " + sumB);
                                                //var sample_size = marks_obtd.length;
                                                meanB = sumB / (sample_sizeB);
                                                console.log("Mean ---- : " + meanB);
                                                //res.send(marks_obtd);
                                                callback1();
                                            }
                                        );

                                    }
                                    , function (callback2) {
                                        async.eachOf(responses,
                                            function (quizResp, index, callback22) {
                                                console.log("Marks:---\n" + quizResp.percent_marks);
                                                sum1B += Math.pow(quizResp.percent_marks - meanB, 2);
                                                callback22();

                                            },
                                            function (err) {
                                                console.log("End of loop " + sum1B +"Sample size B---- "+sample_sizeB);
                                                //var sample_size = responses.length;
                                                varianceB = sum1B / (sample_sizeB - 1);
                                                //res.send(marks_obtd);

                                                callback2();
                                            }
                                        );
                                    }]
                                    , function (err) {
                                    if (err)
                                        console.log(err);
                                    else {
                                        std_deviationB = (Math.sqrt(varianceB)).toFixed(2);
                                        console.log("Standard dev: " + std_deviationB);
                                        console.log("Variance  :" + varianceB);
                                        valueB = z * (std_deviationB / Math.sqrt(sample_sizeB - 1));
                                        ci1B = (meanB - valueB).toFixed(2);
                                        ci2B = (meanB + valueB).toFixed(2);
                                        console.log("Confidence Interval :" + ci1B + " to " + ci2B);

                                    }
                                    cbk();

                                }
                            );
                        }
                    });
        }
        ],
        function (err) {
            if(err)
                console.log(err);
            else{
                console.log("Mean------ "+ mean +"  "+meanB);
                res.render('showAnalyticsResult',{quiz_name:quizName ,
                    ci1: ci1,ci2:ci2,
                    mean:mean, std_dev:std_deviation,
                    variance:variance,
                    ci1B: ci1B,ci2B:ci2B,
                    meanB:meanB, std_devB:std_deviationB,
                    varianceB:varianceB
                });
            }

    });






};





