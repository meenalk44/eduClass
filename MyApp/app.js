var express = require('express');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var app = express();



var routes = require('./routes')
  , dbconn = require('./helpers/dbconn')
  ,	dbSeed = require('./helpers/dbSeed')
  //, login = require('./routes/login')
  , signUpTeacher = require('./routes/signUpTeacher')
  , driveController = require('./routes/driveController')
  , qnaController = require('./routes/qnaController')
  ,	discussionController = require('./routes/discussionController')
  , quizController = require('./routes/quizController')
  ,	classController = require('./routes/classController')
  ,	qnaSchema = require('./models/qnaSchema')
  , User = require('./models/userSchema')
  , Class = require('./models/classSchema')
  
  , http = require('http')
  , path = require('path');





require('./config/passport')(passport);

// all environments
app.set('port', process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(session({ secret: 'eduClassLogin',
				  resave: false,
				  saveUninitialized: true})); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.use(flash());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() ||  req.url === "/" || req.url.startsWith("/auth/google")
		|| req.url.startsWith("/auth/google/callback")
        || req.url.startsWith("/signUpTeacher")
		|| req.url.startsWith("/signUp")) {
        return next();
    } else {
        res.redirect('/');
    }
}

app.get('*', isLoggedIn,function(req, res, next) {
	/*User.find({}).exec(function (err, users) {
		if(err)
			console.log(err);
		else{
			req.user = users[0];
			res.locals.currentUser = users[0];
			next();
		}

    });*/
    res.locals.currentUser = req.user;
    next();

});

app.post('*', isLoggedIn, function (req,res,next) {
    /*User.find({}).exec(function (err, users) {
        if(err)
            console.log(err);
        else{
            req.user = users[0];
            res.locals.currentUser = users[0];
            next();
        }

    });*/
    res.locals.currentUser = req.user;
    next();

});

app.get('/',function(req,res){
	if(req.user) {
		res.redirect("/profile");
	} else {
		res.render('login',{'entry':null});
	}
	
});
app.get('/signUp', function(req,res){
	res.render('signUp');
});

app.post('/signUpTeacher',signUpTeacher.signUp);

app.get('/profile', function(req, res) {
    console.log("Profile************* ");
    res.render('profile.ejs', {
        user : req.user
    });
});

app.get('/logout', function(req, res) {

    res.locals.currentUser = undefined;
	req.session.destroy(function (err) {
        req.logOut();
        res.redirect('/');
    });
});


function emailInDB(req, res, next) {
	var emailParam = req.param('email');
	console.log("---EmailInDB--***** "+emailParam);

	User.find({'email': emailParam}, function(err, users) {
		if(err) {
			console.log(err);
		} else {
			//console.log("else "+ users.length);
			if(users.length === 0) {
				// send error saying not a valid user
				console.log("No users found");
				res.render('error',{msg:'Login Failed! You are not registered! To sign up as Teacher click on "Sign Up as Teacher" button.',redirect:'/'});
			} else {
				return next();
				
			}
		}
		
	});
    
}

app.get('/auth/google', emailInDB, passport.authenticate('google',
		{ scope : ['https://www.googleapis.com/auth/plus.login',
		           'email']
		}
		));


app.get('/auth/google/callback',
    passport.authenticate('google', {
       failureRedirect : '/'
    }),
	function (req,res) {
		res.redirect('/profile');
	});





function checkRole(req,res,next){
	if(req.user.role === "Student")
		res.redirect('/error');
	else
		return next();
}

app.get('/classes',classController.classIndex);
app.get('/classes/:id/manage', checkRole,classController.manageStudents);
app.post('/addStudents/:id', classController.addStudents);
app.get('/classSettings/:class_id/:id',checkRole, classController.removeStudents);
app.post('/classCreate',checkRole, classController.createClass);
app.get('/classes/:id/template', classController.templateSettings);
app.post('/classes/:id/changeDiscussionTemplate', classController.changeDiscussionTemplate);
app.post('/classes/:class_id/changeRatingTemplate',classController.changeRatingTemplate);


app.get('/error',function(req,res){
	res.render('error',{msg:'You are not authorized to view this page!'});
});

app.get('/success',function(req,res){
    res.render('success',{msg:'New Class Created!', redirect:'./classes'});
});



app.get('/classes/:class_id/discussion/:id', discussionController.dicussionShow);
app.post('/classes/:class_id/discussion/:id', discussionController.postQue);
app.post('/classes/:class_id/discussion/:discussion_id/que/:ques_id',discussionController.postAns);
app.post('/classes/:class_id/discussion/:discussion_id/que/:ques_id/ans/:ans_id',discussionController.postReply);
app.post('/classes/:class_id/discussion/:discussion_id/ans/:ans_id/upvote', discussionController.upvoteAnswer);
app.post('/classes/:class_id/discussion/:discussion_id/ans/:ans_id/downvote',discussionController.downvoteAnswer);

app.get('/analytics/discussion_id/:discussion_id',discussionController.totalParticipation);

app.get('/classes/drive/:id',driveController.dController);
app.get('/driveController', driveController.dController);

app.get('/classes/:class_id/quizSettings',quizController.quizSettings);
app.post('/createQuiz/class_id/:class_id', quizController.createQuiz);
app.get('/classes/:class_id/availableQuizzes',quizController.availableQuizzes);
app.get('/takeQuiz/:quiz_id/student_id/:user_id',quizController.takeQuiz);
app.post('/storeQuizResponse/:quiz_id/quiz_name/:quiz_name/class_id/:class_id',quizController.storeQuizResponse);
app.get('/evaluate/:quiz_id',quizController.renderEvaluate);
app.get('/evaluateQuizResp/:quiz_id/student_id/:student_id',quizController.evalStudentResp);
app.post('/storeScores/quizResp/:quizResp_id/quiz_id/:quiz_id/student_id/:student_id',quizController.storeScores);
app.get('/viewResults/quiz_id/:quiz_id/',quizController.viewResults);
app.get('/classes/:class_id/quizScores',quizController.showScore);
app.get('/analytics/quiz_id/:quiz_id',quizController.showAnalytics);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
