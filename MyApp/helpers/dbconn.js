var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var dbURI = 'mongodb://localhost/eduClassDB';
mongoose.connect(dbURI);


