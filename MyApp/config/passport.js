var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/userSchema');
var configAuth = require('./auth');
module.exports = function(passport){
	//console.log("passport.js");
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
    
    function(token, refreshToken, profile, done){
    	process.nextTick(function() {
    		//console.log("*** passport :"+ profile);
            //find the user based on their google id
            User.findOne({ 'google_id' : profile.id }, function(err, user) {
                if (err){
                	return done(err);
                }
                if (user) {

                    // user is found, log them in
                    return done(null, user);
                } else {
                    // if the user is not in db create a new user
                    var newUser = new User({
                    	// set all of the relevant information
                        google_id : profile.id,
                        token : token,
                        refresh_token : refreshToken,
                        //newUser.username
                        fullname  : profile.displayName,
                        profile_img : profile.picture,
                        email : profile.emails[0].value
                    	
                    });
                    newUser.save(function(err) {
                        if (err){
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    
    }));
};