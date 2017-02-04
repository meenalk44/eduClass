/**
 * New node file
 */
var async = require('async');

var google = require('googleapis');

module.exports.dController = function(req, res){
	
	console.log("Drive controller");
	
	var CLIENT_ID = "42298233427-km2vupbbpv4h250tajomiu4u12k7ojd3.apps.googleusercontent.com";
	var CLIENT_SECRET = "bYqfCUSgoo870Xd0JVhwTMvt";
	//var REDIRECT_URL = "http://www.example.com/oauth2callback";
	var REDIRECT_URL = "http://localhost:3000";
	var REFRESH_TOKEN = "";
	
	



	var drive = google.drive({
		version : 'v3'
	});

	var OAuth2 = google.auth.OAuth2;

	var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

	google.options({
		  auth: oauth2Client
		});

	var scopes = [
	              	'https://www.googleapis.com/auth/drive',
	              	'https://www.googleapis.com/auth/drive.file',
	              	];

	var url = oauth2Client.generateAuthUrl({
		access_type : 'offline',
		scope : scopes
	});
	console.log(url);
	
	oauth2Client.getToken(function(err, tokens) {
	      // Now tokens contains an access_token and an optional refresh_token. Save them.
	      if(!err) {
	        console.log("tokens: ",tokens);
	      }
	        //refresh_token
	        oauth2Client.setCredentials(tokens);
	      });
	
	function listFiles(auth) {
		  var service = google.drive('v3');
		  service.files.list({
		    auth: auth,
		    pageSize: 10,
		    fields: "nextPageToken, files(id, name)"
		  }, function(err, response) {
		    if (err) {
		      console.log('The API returned an error: ' + err);
		      return;
		    }
		    var files = response.files;
		    if (files.length == 0) {
		      console.log('No files found.');
		    } else {
		      console.log('Files:');
		      for (var i = 0; i < files.length; i++) {
		        var file = files[i];
		        console.log('%s (%s)', file.name, file.id);
		      }
		    }
		  });
	}
	
	listFiles();
};      
/*
	module.exports = (function () {
		  var getTokens = function(code) {
		    oauth2Client.getToken(code, function(err, tokens) {
		      // Now tokens contains an access_token and an optional refresh_token. Save them.
		      if(!err) {
		        console.log("tokens: ",tokens);
		        //refresh_token
		        oauth2Client.setCredentials(tokens);
		        async.auto({
		          userFolder : function(next,result) {
		            return createFolder('test',null,next);
		          },
		          cameraFolder:['userFolder',function(next,result){
		            return createFolder('cam',result.userFolder,next);
		          }],
		          videoFolder:['cameraFolder',function(next,result){
		            return createFolder('video',result.cameraFolder,next);
		          }]
		        },function(err,result){
		          if(!err){
		            console.log("result: ",result);
		          }else{
		            console.log("error: ",err);
		          }
		        });
		      }else {
		        console.log("error: ",err);
		      }
		    });
		  };
		  
		//creating the folder in drive
		  function createFolder(name,folderId,next) {
		    var folderIds=[];
		    if(folderId !== null){
		      folderIds.push(folderId);
		    }
		    var fileMetadata = {
		      'name' : name,
		      'mimeType' : 'application/vnd.google-apps.folder',
		       parents: folderIds
		    };
		    drive.files.create({
		      resource: fileMetadata,
		      fields: 'id'
		    }, function(err, file) {
		      if(err) {
		        console.log("error creating folder: ",err);
		        next(err);
		      } else {
		        console.log('Folder Id: ', file.id);
		        next(err,file.id);
		      }
		    });
		  }
		  return {
		    getTokens:getTokens
		  };
		})();
	
};*/