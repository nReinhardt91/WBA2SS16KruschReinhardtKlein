var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');
var ejs = require('ejs');
var request = require('request');

var jsonParser = bodyParser.json();
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/rezepte', function(req, res){
  fs.readFile('./Pages/rezepte.ejs', function(err, page) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(page);
    res.end();
  });
});

app.get('/', function(req, res){
  fs.readFile('./Pages/main.html', function(err, page) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(page);
    res.end();
  });
});

app.get('/addRezept', function(req, res){
	fs.readFile('./Pages/addRezept.html', function(err, page) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(page);
    res.end();
  });
});

app.post('/addRezept', function(req, res) {

  var options={
                host: 'localhost',
                port:  3000,
                path: '/addRezept',
                method: 'POST',
                contenttype: 'application/json'
              }

  var rezept={
    "name": req.body.name,
    "preparation": req.body.zubereitung,
    "level":req.body.level,
  };
  request.post(
      "http://localhost:3000" + '/addRezept', {
          json: rezept
      , }
      , function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body);
              res.status(200).send('OK');
          } else {
              handleInternalError(req, res);
          };
      });
});
//   rezept.name = req.body.name;
//   rezept.preparation = req.body.zubereitung;
//   rezept.level = req.body.level;
//
//   var rezeptj = JSON.stringify(rezept);
//
//   var request = http.request(options, function(response) {
//   console.log('STATUS: ' + response.statusCode);
//   console.log('HEADERS: ' + JSON.stringify(response.headers));
//   response.setEncoding('utf8');
//   response.on('data', function (chunk) {
//     console.log('BODY: ' + chunk);
//
//   });
//
// });
// request.write(rezeptj);
// request.end();
// // write data to request body
// console.log(JSON.stringify(rezept));
//
//
//   console.log("reqbody: "+req.body.name)
//   console.log(rezeptj);
//
//   fs.readFile('./Pages/addRezept.html', function(err, page) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(page);
//     res.end();
//    });
// });

// Alle rezepte ausgeben--------------------------------------------------------
app.get('/rezepte', function(req,res){
  var options = {
    host: 'localhost',
    port: 3000,
    path: '/rezepte'
  };

  http.get(options, function(res) {
  console.log("Got response: " + res.body);
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
});

app.listen(5555, function(){
console.log("Server listens on Port 5555");
})
