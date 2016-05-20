// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var jsonParser=bodyParser.json();

var app=express();

var serverPort=1337;

var recipes = [
    {name: "Spiegelei", preparation: "Ei in die Pfanne", level: 1},
    {name: "Reis", preparation: "Wasser kochen...", level: 1},
    {name: "Auflauf", preparation: "aufwendig", level: 3}
];

//content-negotiation
/*
app.get('/', function(req, res){
var acceptetTypes=req.accepts(['html', 'json']);
    switch(acceptetTypes){
    case 'html': 
            res.type('html').send('<h1>HelloWorld</h1>');
            break;
    case 'json':
            res.json(recipes);
            break;
    default: 
        res.status(406).end();
    }
});
*/


//get Methode -> Filtern anhand Schwierigkeitsgrad
app.get('/recipes', function(req, res){
    
    //Beispiel-URL: http://localhost:1337/recipes?level=1
    //request gesetzt, dann ausgeben
    if (req.query.level!==undefined){
        res.json(recipes.filter(function(e, i, arr){
            return e.level == req.query.level}));
    }
    else {
        //kein Query-Parameter angegeben, dann alle ausgeben
        res.status(200);
        res.json(recipes);
    }
});



app.listen(serverPort, function(){
    console.log('App listens on Port '+serverPort);
});
