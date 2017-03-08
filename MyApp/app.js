var express = require('express')
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
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
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

app.get('*', function(req, res, next) {
	res.locals.currentUser = req.user;	
	next();
});




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//app.get('/', routes.index);
app.get('/',function(req,res){
	if(req.user) {
		res.redirect("/profile");
	} else {
		res.render('login',{'entry':null});
	}
	
	/*User.remove({}, function(){
		console.log("----");
	});*/
});
app.get('/signUp',function(req,res){
	res.render('signUp');
});

app.post('/signUpTeacher',signUpTeacher.signUp);


function emailInDB(req, res, next) {
	var emailParam = req.param('email');
	console.log(emailParam);

	User.find({'email': emailParam}, function(err, users) {
		if(err) {
			console.log(err);
		} else {
			//console.log("else "+ users.length);
			if(users.length === 0) {
				// send error saying not a valid user
				console.log("No users found");
				res.render('error',{msg:'You are not registered! To sign up as Teacher click on "Sign Up as Teacher" button.'});
			} else {
				return next();
				
			}
		}
		
	});
    
}

app.get('/auth/google', emailInDB, passport.authenticate('google',
		{ scope : ['profile', 
		           'email',
		           'https://www.googleapis.com/auth/drive',
			       'https://www.googleapis.com/auth/drive.file'] }));

app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
        }));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    //console.log("isLoggedIn");
    // if user is not logged in
    res.redirect('/');
}

app.get('/profile', isLoggedIn,function(req, res) {
    res.render('profile.ejs', {
        user : req.user 
    });
});

app.get('/classes',classController.classDetails);

app.get('/classes/:id', classController.classSettings);
app.post('/addStudents/:id', classController.addStudents);
app.get('/classCreate',classController.createClass);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/driveController', driveController.dController);
app.get('/qna', qnaController.qnaShow);
app.post('/qna',qnaController.qnaPostQ);
app.post('/qnaAns',function(req,res){
	console.log("-----------* "+ req.body.entryID +"    : "+ req.body.ansBody);
});
app.post('/qna',qnaController.qnaRating);
app.get('/quiz',quizController.quizShow);
app.post('/quizCreate', quizController.quizCreate);
app.post('/quizAns',quizController.storeAns);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
