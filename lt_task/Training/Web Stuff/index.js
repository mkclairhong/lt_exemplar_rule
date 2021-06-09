var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var app = express();

app.use(express.static(__dirname+"/www")).listen(8080);


// Middleware to parse the payload of http requests
// Parse encoded urls
app.use(bodyParser.urlencoded({extended: true}));
// Parse all request bodies as json
app.use(bodyParser.json());

app.get('/write', function(req, res) {
	var file = __dirname + '/data/myFile.txt'
	fs.appendFile(file, "some data\n", function() {
		res.send('wrote to ' + file);
	});
});


app.post('/write', function(req, res) {
	var dir = __dirname + '/data/' + req.body.gameType;
	var file = dir + '/' + req.body.id + '.txt';
	mkdirp(dir, function(err) {
		if (err) {
			console.log(err);
		} else {
			fs.appendFile(file, req.body.overallTrial+","
				+req.body.correct+","
				+req.body.inputA+","
				+req.body.inputB+","
				+req.body.correctAnswer+","
				+req.body.guess+","
				+req.body.trialTime+","
				+req.body.overallTime+"\n", function() {
					res.send('wrote to ' + file);
				});
		}
	});
});

console.log("The server has started. To stop the server, close the console.");
