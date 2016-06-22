var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var http=require('http');
var ejs=require('ejs');
var fs=require('fs');

var options={
host: 'localhost',
port:3000,
path: 'main',
method: 'GET',
headers: {
    accept: 'application/json'
}
};
fs.readFile('./Pages/main.ejs', {encding:"utf-8"}, function(err, filestring){
if (err){
//throw err;
}
var html=ejs.render(filestring, options);
});

app.engine('html', require('ejs').renderFile);


var test={rezepte:[
    {rezept: 'Pizza'},
     {rezept: 'nope'}
]}
//var html=ejs.render(str, test);
var x=http.request(options, function(res){
console.log("Connected");
    res.on('data', function(chunk){
    console.log('Body'+chunk);
    });

});
x.end();
