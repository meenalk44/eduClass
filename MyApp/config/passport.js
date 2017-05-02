var GoogleStrategy = require('passport-google-oauth2').Strategy;
var User = require('../models/userSchema');
var configAuth = require('./auth');
var async = require('async');
module.exports = function(passport){

	passport.serializeUser(function(user,done){
		done(null, user.id);
	});
	
	passport.deserializeUser(function(id,done){
		User.findById(id, function(err, user) {
            done(err, user);
        });
	});
		
	passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL

    },
    
    function(accessToken, refreshToken, profile, done){
    	process.nextTick(function() {
    		console.log("*** passport :"+ profile.id);
            //find the user based on their google id
            User.findOne({ 'google_id' : profile.id }, function(err, user) {
                if (err){
                	return done(err);
                }
                if (user) {
                    console.log("User found: "+ user);
                	/*User.find({}).exec(function(err,entries){
        				if(err){
        					res.send("Error");
        				}else{
        					console.log(entries);
        				}

        			});*/
                    // user is found, log them in
                    return done(null, user);
                } else {
                    // if the user is not in db create a new user
                    var newUserSet = '';
                    User.find({}).exec(function(err,users) {
                        if (err) {
                            res.send("Error");
                        } else {
                            console.log(users);
                            var length = users.length;
                            if(length <=1 ){
                                newUserSet = 'A';

                            }else{
                                if(users[length - 2] == 'A')
                                    newUserSet = 'B';
                                else
                                    newUserSet = 'A';
                                console.log("New User Set "+ newUserSet);
                                var newUser = {
                                    google_id : profile.id,
                                    token : accessToken,
                                    refresh_token : refreshToken,
                                    //newUser.username
                                    fullname  : profile.displayName,
                                    profile_img : profile.photos[0].value,
                                    user_set : newUserSet

                                };
                                User.findOneAndUpdate({'email':profile.emails[0].value},newUser, {new: true},function(err,users){
                                    if(err)
                                        console.log(err);
                                    else{
                                        console.log("----- "+users);
                                    }
                                    return done(null, users);
                                });
                            }
                        }
                    });
                }
            });
        });
    
    }));
};