// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');
var db=redis.createClient();
var jsonParser=bodyParser.json();

var app=express();
app.use(jsonParser);
var serverPort=1337;



/*var recipes = [
    {name: "Spiegelei", preparation: "Ei in die Pfanne", level: 1},
    {name: "Reis", preparation: "Wasser kochen...", level: 1},
    {name: "Auflauf", preparation: "aufwendig", level: 3}
];
*/
/*Anlegen "Grundstock"*/
int i=0;
var recipes1={name: "Spiegelei", preparation: "Ei in die Pfanne", level: 1};
var recipes2={name: "Reis", preparation: "Wasser kochen...", level: 1};
var recipes3={name: "Auflauf", preparation: "aufwendig", level: 3};
db.set("recipe"+i, JSON.stringify(req.body)); 
i++;
db.set("recipe"+i, JSON.stringify(req.body));
i++;
db.set("recipe", JSON.stringify(req.body));
i++;

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

//Post
// URL http://localhost:1337/recipe
app.post('/recipe', jsonParser, function(req, res){
    var nameRecipe=req.body.name;
    var preparationRecipe=req.body.preparation;
    var levelRecipe=req.body.level;
    
    var recipe={};
    recipe.name=nameRecipe;
    recipe.preparation=preparationRecipe;
    recipe.level=levelRecipe;
    db.set("recipe"+i, JSON.stringify(req.body));
    db.get("", function(res, req){
    console.log(req);
    });
    //console.log('request =' + JSON.stringify(req.body));
	res.send("Funktioniert: " + JSON.stringify(req.body));
});


app.listen(serverPort, function(){
    console.log('App listens on Port '+serverPort);
});




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
