var GoogleStrategy = require('passport-google-oauth2').Strategy;
var User = require('../models/userSchema');
var configAuth = require('./auth');
module.exports = function(passport){
	//console.log("in passport.js");
	passport.serializeUser(function(user,done){
		done(null, user.id);
	});
	
	passport.deserializeUser(function(id,done){
//		User.remove({}, function(){
//			console.log("----");
//		})
		User.findById(id, function(err, user) {
            done(err, user);
        });
	});
		
	passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    
    function(accessToken, refreshToken, profile, done){
    	process.nextTick(function() {
    		//console.log("*** passport :"+ profile);
            //find the user based on their google id
            User.findOne({ 'google_id' : profile.id }, function(err, user) {
                if (err){
                	return done(err);
                }
                if (user) {
                	console.log(user.profile_img +"*** Picture : "+ profile.photos[0].value);
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
                    
                    var newUser = {
                    		google_id : profile.id,
                            token : accessToken,
                            refresh_token : refreshToken,
                            //newUser.username
                            fullname  : profile.displayName,
                            profile_img : profile.photos[0].value
                    		
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
            });
        });
    
    }));
};