var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Quiz = require('../models/quizSchema');
var async = require('async');
var Promise = require('bluebird');
var User = require('../models/userSchema');


module.exports.quizSettings = function(req, res){
	var class_id = req.param('class_id');
  	res.render('quiz',{'class_id':class_id});
};

/*
module.exports.createQuiz = function(req,res){
	console.log("Inside quiz controller--------\n");
    var class_id = req.param('class_id');
    console.log(class_id);
	var numOfQues = Object.keys(req.body).length;
	var time = new Date();
	time = time.toDateString();
    Quiz.update({'id': '58e7b96c38bcd90eecd08da8'}, {
            $push: {
                'questions': {
                    $each: [
                        {
                            'que_num': 222,
                            'que_body': 'Update ho ja yaar'
                        }
                    ]
                }
            }
        },
        function(err, entries) {
            if (err) {
                res.send("Error");
            } else {
                console.log("****"+ JSON.stringify(entries));
                res.send(entries);


            }

            // res.render('showQuiz', {entries: JSON.stringify(entries)});
        });
    /*var newQue = new Quiz({
        class_id: class_id,
        questions:{
            que_num : 1,
            que_body : req.body.textbox1 ,

        },
        timestamp: time,
        user_id : req.user.id,
        fullname : req.user.fullname,
        profile_img : req.user.profile_img
    });*/
	//var cnt = 1;

	//console.log(req.param('msg'));

        /*var textboxNum = "textbox"+cnt;
        console.log(textboxNum);


    }*/
	/*console.log(newQue);
    Quiz.update({'id': '58e7b96c38bcd90eecd08da8'}, {
            $push: {
                'questions': {
                    $each: [
                        {
                            'que_num': 222,
                            'que_body': 'req.body.textboxNum'
                        }
                    ]
                }
            }
        },
        function(err, entries) {
            if (err) {
                res.send("Error");
            } else {
                console.log("****"+ JSON.stringify(entries));
                res.send(entries);


            }

            // res.render('showQuiz', {entries: JSON.stringify(entries)});
        });*/
	/*newQue.save(function(err,quiz){
		if(err){
			return console.log("Error while posting question to db");
		}else{

			//var textboxNum = "textbox"+cnt;
			console.log("____ "+ req.body.textboxNum);
			console.log("Question saved to db:  "+quiz.id);
            //for(var cnt =1;cnt<=numOfQues; cnt++) {
			/!*async.each(numOfQues,function (cnt,callback) {
				console.log("888 "+cnt+"   "+index);
				callback();

            },function (err) {
				if(err)
					console.log(err);
				else {
                    console.log("end");
                }

            });*!/
                //textboxNum = "textbox"+cnt;


           // }

		}
	});

};
*/


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
                que_num : cnt,
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
                 profile_img : req.user.profile_img
                 //questions : newQue

             });
            console.log("**** "+ newQuiz);
            newQuiz.save(function(err, quiz){
                 if(err)
                    console.log(err);
                 else{
                    //res.send(quiz);
                     async.each(ques_arr,function (queObj, cb) {
                         Quiz.update({'id':quiz.id},{$push:{'questions':{$each: queObj}}},
                             function (err,savedResp) {
                                if(err)
                                    res.send("ERR in Update"+err);
                                else{
                                    console.log("AFter Update  :  "+JSON.stringify(savedResp));
                                }

                             });
                         cb();


                     },
                     function (err) {
                         console.log("Q    "+quiz);

                     });
                     //console.log("Quiz: "+quiz);
                 }
             });
        }

    });
    /*for (var property in req.body) {
        if (req.body.hasOwnProperty(property)) {
            var cnt = 1;
            var newQue ={
                    que_num : cnt,
                    que_body: req.body[property]
            };
            cnt++;
        }
        console.log("---- "+newQue);
    }*/


};

module.exports.storeAns = function(req,res){
	console.log("---------*****"+JSON.stringify(req.body));
};