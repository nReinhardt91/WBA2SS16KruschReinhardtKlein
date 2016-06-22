var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var http=require('http');
var ejs=require('ejs');
var fs=require('fs');

app.get('/rezepte', jsonParser, function(req,res){
    fs.readFile('./Pages/rezepte.ejs', {encoding: 'utf-8'}, function(err, filestring){
        if (err){
            throw err;

        } else {
            var options={
                host: 'localhost',
                port:3000,
                path: '/rezepte',
                method: 'GET',
                headers: {
                accept: 'application/json'
                }
            }
           }
        
            var externalRequest=http.request(options, function(externalResponse){
                console.log('Connected');
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var rezeptedata=JSON.parse(chunk);
                    console.log(rezeptedata);
                    res.send(rezeptedata);
                    
                    
                    
                    var html=ejs.render(filestring, {rezeptedata: rezeptedata});
                    res.setHeader('content-type', 'text/html');
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
    });
});
      
app.listen(3001, function(){
console.log("Server listens on Port 3001");
})