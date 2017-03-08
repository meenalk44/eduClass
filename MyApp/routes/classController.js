var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var QnA = require('../models/qnaSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');

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
	res.render('classSettings',{id:id});
	//res.render('success',{msg:'',redirect:'/'});
	
};

module.exports.addStudents = function(req,res){
	var id = req.param('id');
	console.log("add.... "+id);
	var stud_id_arr =[];
	var emails = req.body.stud_id;
	var email_arr = emails.split(",");
	
	email_arr.forEach(function(email){
		var newUser = new User({
			email: email,
			role: 'Student'
		});
		console.log(newUser);
		newUser.save(function(err,entry){
			if(err){
				return console.log("Error while posting student to db");
			}else{
				console.log("student saved to db:  "+entry);
				stud_id_arr.push(entry._id);
				
				
			}
		});
		
	});
	
	var newClassStudents = new Class({
		student_ids:stud_id_arr
	});
	process.nextTick(function(){
		console.log(stud_id_arr);
		Class.findOneAndUpdate({'id':id},newClassStudents,{new:true},function(err,entries){
			if(err)
				console.log("Could not find classes");
			else{
				console.log("saved students to class"+entries);
				
			}
		});	
		Class.find({}).exec(function(err, entries){
			if(err)
				console.log(err)
			else{
				console.log("-------");
				console.log(entries);
				console.log("-------");
				//res.render('classSettings',{entries:JSON.stringify(entries)});
			}
		});
	});
	
	
	//res.redirect('/classes');

	
};

module.exports.classDetails = function(req,res){
	var teacherId = req.user._id;
	console.log(teacherId);
	
//	Class.findById(teacher_id,function(err,entries){
//		if(err)
//			console.log("Could not find classes");
//		else
//			console.log(entries);
//			
//			
//	});	
	var count = 0;
	/*Class.count('student_ids')
	.where('teacher_id').equals(teacherId).exec(function(err,cnt){
		if(err)
			console.log(err);
		else{
			count = cnt;
			console.log("*** "+cnt);
			//res.render('classes',{entries:JSON.stringify(entries), count:cnt});
		}
	});*/
	
	Class.aggregate([
	                 {$project	:	{
	                	 item	:	1,
	                	 count	:	{	$size	:	"$student_ids"}
	                 }}
	]);
	console.log("***## "+count);
	Class.find({}).exec(function(err, entries){
		if(err)
			console.log(err)
		else{
			
			res.render('classes',{entries:JSON.stringify(entries), count:count});
		}
	});
	
};