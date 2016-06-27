// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');

var db=redis.createClient();
var app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var uri;

// Alle Rezepte ausgeben
app.get('/rezepte', function(req, res){
  console.log("/rezepte -- GET");

    db.keys('rezepte:*', function(err, rep){
        var rezepte = [];

        if (rep.length == 0) {
            res.json(rezepte);
            return;
        }
        var uris=[];

        db.mget(rep, function(err, rep){

            rep.forEach(function(val){
                _json = JSON.parse(val);
                rezepte.push(JSON.parse(val));
        uris.push({"uri": "http://localhost:5555/rezepte/"+_json.id, "name": _json.name});
            });

            rezepte = rezepte.map(function(rezept){
                return {id: rezept.id, name: rezept.name, uris};

                  });
            res.json(uris);
        });
    });

});

//Rezept hinzufügen
app.post('/addRezept', function (req, res) {
  console.log(req.params.name);
  var test=req.body;
  console.log(test.name);
  res.json(req.body);
});

app.listen(3000);
console.log("Listens on 3000");
