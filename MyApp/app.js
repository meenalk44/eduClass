
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , driveController = require('./routes/driveController')
//  , qnaDbConn = require('./routes/qnaDb')
  , qnaController = require('./routes/qnaController')
  , qnaAnswerController = require('./routes/qnaAnswer')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//app.use(qnaDbConn);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/driveController', driveController.dController);
app.get('/qna', qnaController.qna);
app.get('/qnaAnswer',qnaAnswerController.qnaAns);
app.post('/askQuestion',function(req,resp){
	console.log(req.body.topic);
	console.log(req.body.que);
	console.log("--------"+ JSON.stringify(req.body));
});
//driveController.list();
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
