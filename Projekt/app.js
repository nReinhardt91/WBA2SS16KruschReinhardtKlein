// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');
var db=redis.createClient();
var jsonParser=bodyParser.json();

var app=express();
app.use(jsonParser);
var serverPort=1337;

var x=0;


/*var recipes = [
    {name: "Spiegelei", preparation: "Ei in die Pfanne", level: 1},
    {name: "Reis", preparation: "Wasser kochen...", level: 1},
    {name: "Auflauf", preparation: "aufwendig", level: 3}
];
*/
/*Anlegen "Grundstock"*/
//get Methode -> Filtern anhand Schwierigkeitsgrad
/*REZEPTE*/

/*ein Rezept ausgeben*/
//app.get('/rezepte:id', function(req, res){
////Beispiel-URL: http://localhost:1337/recipes?level=1
//    var rezeptName="rezept:"+req.query.id;
//    db.hgetall(rezeptName, function(res, req){
//        console.log(req);
//    });
//    res.send("Funktioniert: " + JSON.stringify(res.body));
//});
/*Alle Rezept ausgeben*/
app.get('/rezepte', function(req, res){
///Beispiel-URL: http://localhost:1337/recipes?level=1

 for (i = 1; i <= x; i++){
       db.hgetall("rezept:"+i, function(res, req){
           console.log(req);
        });
      
    }
    res.json("http://localhost:1337/rezept:"+i);
});

//Rezepte Post
// URL http://localhost:1337/recipe
app.post('/rezepte', jsonParser, function(req, res){
    var nameRecipe=req.body.name;
    var preparationRecipe=req.body.preparation;
    var levelRecipe=req.body.level;
    var recipe={};
    recipe.name=nameRecipe;
    recipe.preparation=preparationRecipe;
    recipe.level=levelRecipe;
 /*   db.incr("rezeptid");*/
    var id="rezept:"+x;
    db.hmset(id, {"name":recipe.name, "preparation":recipe.preparation, "level":recipe.level});
    db.hgetall(id, function(res, req){
    console.log(req);
    });
    x++;
   
	res.send("Funktioniert: " + JSON.stringify(req.body));
});



/*rezepte PUT*/


/*rezepte DELETE*/
//Beispiel-URL: http://localhost:1337/rezepte?id=2
app.delete('/rezepte', jsonParser, function(req, res){
   var rezeptName="rezept:"+req.query.id;
   db.del(rezeptName);
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
