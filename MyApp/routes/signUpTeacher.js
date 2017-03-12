var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var User = require('../models/userSchema');

module.exports.signUp = function(req,res){
	var newUser = new User({
		email: req.body.email,
		role: 'Teacher'
	});
	console.log(newUser);
	newUser.save(function(err,entry){
		if(err){
			return console.log("Error while posting teacher to db");
		}else{
			console.log("Teacher saved to db:  "+entry);
			//req.flash('info','Successfully signed up as Teacher');
			User.find({}).exec(function(err,entries){
				if(err){
					res.send("Error");
				}else{
					console.log(entries);
					
				}
				res.redirect('/');
					
			});
		}
	});

	
};
		