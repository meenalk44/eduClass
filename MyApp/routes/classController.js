var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var QnA = require('../models/qnaSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');
var Promise = require('bluebird');

module.exports.createClass = function(req,res){
	var qnaId = req.user.id+'ABC';
	console.log(qnaId);
	var newClass = new Class({
	class_name	: req.param('className'),
	teacher_id : req.user.id,
	qna_id	:	qnaId
	});
	newClass.save(function(err,entry){
		if(err)
			console.log(err);
		else{
			console.log(entry);
			
			res.render('success',{msg:'New Class Created!', redirect:'classDetails'});
		}
	});
};

module.exports.classSettings = function(req,res){
	console.log("in classSettings");
	var id = req.param('id');
	console.log(id);
	var entries=[];
	res.render('classSettings',{entries : JSON.stringify(entries),id:id});
	//res.render('success',{msg:'',redirect:'/'});
	
};


module.exports.addStudents = function(req,res){
	var id = req.param('id');
	console.log("add subject id:.... "+id);
	var stud_id_arr =[];
	var emails = req.body.stud_id;
	var email_arr = emails.split(",");
	var promise_arr = [];
	//var entries = [];
	email_arr.forEach(function(email){
		var p = new Promise(function (resolve, reject){
			var newUser = new User({
				email: email,
				role: 'Student'
			});
			console.log(newUser);
			newUser.save(function(err,entry){
				if(err){
					console.log("Error while posting student to db");
					reject(err);
				}else{
					console.log("student saved to db:  "+entry);
					resolve(entry.id);
					
				}
			});
			
		});
		promise_arr.push(p);
		
	});
	
	console.log("Promise: "+promise_arr);
	
	Promise.all(promise_arr)
		.then(function (stud_id) {
			// update student_ids in class object
			console.log("-----++++ "+ stud_id);
			//stud_id_arr.push(stud_id);
			//console.log("***** "+stud_id_arr);
			Class.findByIdAndUpdate(id, {$set:{student_ids : stud_id}},{new:true}, function(err,docs){
				if(err){
					console.log("Could not find classes");
					console.log(err);
				}
				else{
					console.log("addedToClass");
					//res.render('classSettings',{entries:JSON.stringify(docs),id:id});
					Class.find({})
						.populate('student_ids')
						.exec(function(err,docs){
							console.log(docs);
							res.render('classSettings',{entries:JSON.stringify(docs),id:id});
						});
				}
		});
	});
	
	
	
	
	/*Class.find({}).exec(function(err, entries){
		if(err)
			console.log(err)
		else{
			console.log("-------");
			console.log(entries);
			console.log("-------");
			
		}
		});*/
	
};	
	
	


module.exports.classDetails = function(req,res){
	var teacherId = req.user._id;
	console.log(teacherId);
	Class.find({}).exec(function(err, entries){
		if(err)
			console.log(err)
		else{
			//console.log(entries.student_ids.length);
			res.render('classes',{entries:JSON.stringify(entries)});
		}
	});

};