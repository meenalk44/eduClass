var mongoose = require('mongoose');
var dbconn = require('../helpers/dbconn');
var db = mongoose.connection;
var User = require('../models/userSchema');

User.find({email: "meenalskulkarni@gmail.com"}, function(err, users){
	console.log(users);
	if(users.length === 0) {
		// ccreate user with email = meenal@asu.edu and role = teacher
		var newUser = new User({
			email: 'meenalskulkarni@gmail.com',
			role: 'Teacher'
		});
		//console.log(newUser);
		newUser.save(function(err,entry){
			if(err){
				return console.log("Error while posting user to db in dbSeed.js");
			}else{
				console.log("User saved to db:  "+entry);
				
			}
		});
	}
})