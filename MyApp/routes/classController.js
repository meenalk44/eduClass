var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var Discussion = require('../models/discussionForumSchema');
var User = require('../models/userSchema');
var Class = require('../models/classSchema');
var Promise = require('bluebird');

module.exports.createClass = function(req,res){
	var discussion_template_A = req.body.radioOpt1;
	var discussion_template_B = req.body.radioOpt1b;
	var rating_template_A = req.body.radioOpt2;
    var rating_template_B = req.body.radioOpt2b;
	var newClass = new Class({
		class_name	: req.body.className,
		teacher_id : req.user.id,
		template_A:{

            template_discussion	:	discussion_template_A,
            template_rating	:	rating_template_A
		},
        template_B:    {
                template_discussion	:	discussion_template_B,
                template_rating	:	rating_template_B
            }

	});
	newClass.save(function(err,entry){
		if(err)
			console.log(err);
		else{
			var newDF = new Discussion({
				class_id: entry.id

			});
			console.log("DF: "+ newDF);
			newDF.save(function(err,entryDF){
				if(err)
					console.log("error in DF");
				else{
					console.log("*****&&& "+entryDF);
					Class.findByIdAndUpdate(entry.id, {$set:{'discussion_id' : entryDF.id}},{new:true}, function(err,docs){
						if(err)
							console.log(err)
						else{
							console.log(docs);
							res.redirect('/success');
							//res.render('success',{msg:'New Class Created!', redirect:'classes'});
						}
					});

					
				}
			});	
			
		}
	});
};

module.exports.classIndex = function(req,res){
    var teacherId = req.user._id;
    //console.log(teacherId);
    Class.find({}).exec(function(err, entries){
        if(err)
            console.log(err)
        else{
            console.log("classDetails: "+ entries);
            res.render('classes',{entries:JSON.stringify(entries)});
        }
    });

};



module.exports.manageStudents = function(req,res){
	console.log("in classSettings");
	var id = req.param('id');
	console.log(id);
	//var entries=[];
	
	Class.findById(id)
	.populate('student_ids')
	.exec(function(err, entry){
		if(err)
			console.log(err);
		else{

			res.render('classSettings',{classEntry : JSON.stringify(entry),class_id:id});
		}
	});
		
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
			/*//--------------------------check if user already exists in db ------------------
			User.find({'email':email}).exec(function(err,user){
				if(err)
					console.log(err);
				else{
					console.log(user);
					if(user == [] || user =={} || user == null){
						 newUser.save(function(err,entry){
							 if(err){
								 console.log("Error while posting student to db");
								 reject(err);
							 }else{
								 console.log("student saved to db:  "+entry);
								 resolve(entry.id);

							 }
						 });

					}
					else{
						console.log("User already exists");
						resolve(user.id);
					}

				}

            });*/


		});
		promise_arr.push(p);
		
	});
	
	console.log("Promise: "+JSON.stringify(promise_arr));
	
	Promise.all(promise_arr)
		.then(function (stud_id) {
			// update student_ids in class object
			console.log("-----++++ "+ stud_id);
				
			Class.update({'_id':class_id},
					{$push:{'student_ids':{$each:stud_id}}},function(err,doc){
						if(err)
							console.log(err);
						else{

                            res.redirect("/classes/" + class_id + "/manage");

						}
					});
			
	});
	
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
            res.redirect("/classes/" + class_id + "/manage");
		}
	});
	
};

module.exports.templateSettings = function (req,res) {
	var class_id = req.param('id');
	//res.render('template',{class_id:class_id});
    Class.findById(class_id,function(err, class_details){
        if(err)
            console.log(err)
        else{
            //console.log("classDetails: "+ entries);
            res.render('template',{class_details:JSON.stringify(class_details)});
        }
    });

};

module.exports.changeDiscussionTemplate = function(req,res){
	var class_id = req.param('id');
	var newTemplate_A = req.body.radioOpt1;
	var newTemplate_B = req.body.radioOpt1b;
	Class.findById(class_id).exec(function (err,classDetails) {
		if(err)
			console.log(err);
		else{
			classDetails.template_A.template_discussion = newTemplate_A;
			classDetails.template_B.template_discussion = newTemplate_B;
			classDetails.save();
            res.redirect("/classes/" + class_id+ "/template");
		}

    });

};

module.exports.changeRatingTemplate = function (req,res) {
	var class_id = req.param('class_id');
	var newTemplate_A = req.body.radioOpt2;
	var newTemplate_B = req.body.radioOpt2b;

    Class.findById(class_id).exec(function (err,classDetails) {
        if(err)
            console.log(err);
        else{
            classDetails.template_A.template_rating = newTemplate_A;
            classDetails.template_B.template_rating = newTemplate_B;
            classDetails.save();
            res.redirect("/classes/" + class_id+ "/template");
        }

    });


};



