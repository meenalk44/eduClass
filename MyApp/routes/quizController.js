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
    var numOfQues = Object.keys(req.body).length;
    var time = new Date();
    time = time.toDateString();
    var newQue ={};
    //var pro = new Promise(function(resolve,reject{
    var cnt = 0;
    async.forEach(Object.keys(req.body), function (prop,callback) {
        if (req.body.hasOwnProperty(prop)) {

            newQue ={
                que_num: cnt,
                que_body: req.body[prop]
            };
            ques_arr[cnt] = newQue;
            cnt = cnt + 1;
        }
        console.log("--- "+ JSON.stringify(newQue));
        callback();
    },function (err) {
        if(err)
            res.send("ERR in ASYNC"+err);
        else{
            console.log("--ASYNC-- "+ JSON.stringify(ques_arr));
            var newQuiz = new Quiz({
                 class_id: class_id,
                 timestamp: time,
                 user_id: req.user.id,
                 fullname: req.user.fullname,
                 profile_img : req.user.profile_img,
                 questions : ques_arr

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
            console.log("---------------\n"+show_arr);
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
    //var student_id = req.param('user_id');
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
            class_id: class_id,
            quiz_id: quiz_id,
            status: 'Completed',
            timestamp: time,
            user_id: req.user.id,
            fullname: req.user.fullname,
            profile_img : req.user.profile_img,
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

    Quiz.find({'_id':quiz_id})
        .populate('quizTakenBy')
        .exec(function (err,completedQuizzes) {
        if(err)
            console.log(err);
        else{
            console.log("Completed**** \n"+completedQuizzes);
            res.render('evalAllTable',{completed:JSON.stringify(completedQuizzes)});
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
                console.log(err)
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
    var totalMarks = req.body.total;
    marksObtd.forEach(function(marks){
        totalObtd += parseInt(marks);

    });
    totalMarks.forEach(function (tot) {
        total += parseInt(tot);

    });

    console.log("Question-------------\n");
    QuizResponse.findOne({'_id':quizResp_id}).exec(function (err,doc) {
        console.log(doc.answers[0]);
        async.eachOf(doc.answers, function (ans, index, callback) {
            var updResp = {
                marks_scored: marksObtd[index],
                max_marks: totalMarks[index]
            };
            ans.marks = updResp;
            doc.save();
            callback();

        }, function (err) {
            console.log(doc);
            doc.marks_obtd = totalObtd;
            doc.total_marks = total;
            doc.save();
            res.render('success', {msg: 'Quiz has been evaluated!', redirect: '/classes'});

        });

        console.log("Question-------------\n");
    });

};




