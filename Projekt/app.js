// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');
var db=redis.createClient();
var jsonParser=bodyParser.json();

var app=express();
app.use(jsonParser);
var serverPort=1337;

var i=4;

/*var recipes = [
    {name: "Spiegelei", preparation: "Ei in die Pfanne", level: 1},
    {name: "Reis", preparation: "Wasser kochen...", level: 1},
    {name: "Auflauf", preparation: "aufwendig", level: 3}
];
*/
/*Anlegen "Grundstock"*/
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
        db.keys("recipe:*", function(res, req){
            var numberOfRecipes=db.keys()
            db.get("", function(res, req){
            console.log(req);
            });
        });
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
    db.set("recipe:"+i, JSON.stringify(req.body));
    db.get("recipe:"+i, function(res, req){
    console.log(req);
    });
    i++;
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
