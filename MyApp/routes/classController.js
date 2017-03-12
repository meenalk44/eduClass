var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');
var Promise = require('bluebird');

module.exports.createClass = function(req,res){
	var newClass = new Class({
	class_name	: req.param('className'),
	teacher_id : req.user.id,
	//qna_id	:	qnaId
	});
	newClass.save(function(err,entry){
		if(err)
			console.log(err);
		else{
			var newDF = new Discussion({
				class_id: entry.id,
				
			});
			console.log("DF: "+ newDF);
			newDF.save(function(err,entryDF){
				if(err)
					console.log("error in DF");
				else{
					console.log("*****&&& "+entryDF);

					res.render('success',{msg:'New Class Created!', redirect:'classes'});
				}
			});	
			
		}
	});
};

module.exports.classSettings = function(req,res){
	console.log("in classSettings");
	var id = req.param('id');
	console.log(id);
	//var entries=[];
	
	Class.findById(id)
	.populate('student_ids')
	.exec(function(err, entries){
		if(err)
			console.log(err)
		else{
			console.log("-------");
			console.log(entries);
			console.log("-------");
			res.render('classSettings',{entries : JSON.stringify(entries),id:id});
		}
	});
	
	//res.render('success',{msg:'',redirect:'/'});
	
};


module.exports.addStudents = function(req,res){
	var class_id = req.param('id');
	console.log("add subject id:.... "+class_id);
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
			
			Class.findByIdAndUpdate(class_id, {'student_ids' : stud_id},{new:true}, function(err,docs){
				if(err){
					console.log("Could not find classes");
					console.log(err);
				}
				else{
					console.log("addedToClass "+docs);
					Class.findById(class_id)
						.populate('student_ids')
						.exec(function(err,docs){
							console.log(docs);
							//res.send(docs);
							res.render('classSettings',{entries:JSON.stringify(docs),id:class_id});
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
	
	
module.exports.removeStudents = function(req,res){
	var stud_id = req.param('id');
	var class_id = req.param('class_id');
	console.log("++++==== "+ class_id +"   : "+stud_id);
	Class.update({'_id':class_id},
			{$pull:{'student_ids':stud_id}},function(err,doc){
		if(err)
			console.log(err);
		else{
		console.log("+++++");
		console.log(doc);
		console.log("+++++");
		//doc.student_ids.pull(stud_id);
		//console.log(doc);
		Class.findById(class_id)
		.populate('student_ids')
		.exec(function(err,docs){
			console.log(docs);
			//res.send(docs);
			res.render('classSettings',{entries:JSON.stringify(docs),id:class_id});
		});
		}
	});
	
};



module.exports.classDetails = function(req,res){
	var teacherId = req.user._id;
	//console.log(teacherId);
	Class.find({}).exec(function(err, entries){
		if(err)
			console.log(err)
		else{
			//console.log(entries.student_ids.length);
			Class.findById(teacherId)
			.populate('discussion_id')
			.exec(function(err,docs){
				console.log("populated: "+docs);
			});
			console.log("classDetails: "+ entries);
			res.render('classes',{entries:JSON.stringify(entries)});
		}
	});

};