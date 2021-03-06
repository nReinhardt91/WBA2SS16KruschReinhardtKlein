var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var http=require('http');
var ejs=require('ejs');
var fs=require('fs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Main Seite
app.get('/', function(req, res){
 fs.readFile('./views/main.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});

const test = new Array;

//Get auf alle Rezepte
app.get('/rezepte', jsonParser, function(req,res){
    fs.readFile('./views/rezepte.ejs', {encoding: 'utf-8'}, function(err, filestring){
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
                    var rezeptedata=JSON.parse(chunk);
                    console.log(rezeptedata);

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




//_________________________________________
app.get("/rezepte/:id", function(req,res){
    fs.readFile("./views/rezept.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/rezepte/"+req.params.id,
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            var optionsZutat={
                host: "localhost",
                port: 3000,
                path: "/rezepte/"+req.params.id+"/zutatenliste",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }
            var zutatenliste;
            var externalRequestZutat=http.request(optionsZutat, function(externalResponse){
            externalResponse.on('data', function(chunk){
                                zutatenliste=JSON.parse(chunk);
            });

            //Statuscodes weiterleiten!!!!
            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Rezept gesucht");
                console.log(zutatenliste);
                if(externalResponse.statusCode === 404){
                    console.log("404 - Rezept not found");
                }
                    externalResponse.on("data", function(chunk){
                        var rezept = JSON.parse(chunk);
                        var erfolg="";
                        console.log(rezept);
                        var html = ejs.render(filestring, {rezept: rezept, zutatenliste:zutatenliste});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
            });
            externalRequest.end();
        });
            externalRequestZutat.end();
        }
});
});
//Rezept löschen

app.post("/rezepte/:id", function(req,res){
    console.log(req.params.id);
            var options = {
                host: "localhost",
                port: 3000,
                path: "/rezepte/"+req.params.id,
                method: "DELETE",
                headers : {
                    accept : "application/json"
                }
            }
             var optionszutat = {
                host: "localhost",
                port: 3000,
                path: "/rezepte/"+req.params.id+"/zutatenliste",
                method: "DELETE",
                headers : {
                    accept : "application/json"
                }
            }
             var zutatenliste;
            var externalRequestZutat=http.request(optionszutat, function(externalResponse){
                externalResponse.on('data', function(chunk){
                    console.log("zutatenliste wurde geloescht");
            var externalRequest = http.request(options, function(externalResponse){

                    externalResponse.on("data", function(chunk){
                        console.log("body: "+chunk)
                        fs.readFile('./views/delRezept.ejs', function(err, page) {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(page);
                        res.end();
                        });
                    });
                });
            externalRequest.end();
            });
        });
    externalRequestZutat.end();
});

//________________________________________________

app.get('/neuesRezept', function(req, res){
	fs.readFile('./views/addRezept.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
//jetzt überflüssig, da Rezept auf einer Seite mit Zutaten angelegt wird
app.get('/rezepte/:id/zutatenliste', function(req, res){
	fs.readFile('./views/addZutatenliste.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
//---------------------------------------------//
//---------------------------------------------//
app.post('/rezepte', function(req, res) {
fs.readFile('./views/addRezept.ejs', {encoding: 'utf-8'}, function(err, filestring){
   var rezept={
    "name": req.body.name,
    "preparation": req.body.zubereitung,
    "level":req.body.level,
  };
  request.post(
      'http://localhost:3000/rezepte', {
          json: rezept
, }
      , function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var rezeptedata=body;
              console.log(rezeptedata);
              res.json(rezeptedata);
              res.end();
          }else {
              handleInternalError(req, res);
          };
      });
});
});





app.post('/rezepte/:id/zutatenliste', function(req, res) {
    fs.readFile('./views/addZutatenliste.ejs', {encoding: 'utf-8'}, function(err, filestring){
  console.log(req.params.id);
  var options={
                host: 'localhost',
                port:  3000,
                path: '/rezepte/'+req.params.id+'/zutatenliste',
                method: 'POST',
                contenttype: 'application/json'
              }

  var zutat=[ req.body.zutat];
    console.log(req.body);
    console.log(req.url);
    request.post('http://localhost:3000'+req.url, {
          json: zutat
      , }
      , function (error, response, body) {
          if (!error && response.statusCode == 201) {
              console.log(body);
              var html=ejs.render(filestring, {zutat: zutat});
                      res.setHeader("content-type", "text/html");
                      res.writeHead(200);
                      res.write(html);
                      res.end();
          }
          else {
              handleInternalError(req, res);
          };
      });
});
});


app.post('/wgs/1/einkaufsliste', function(req, res) {
    fs.readFile('./views/addListe.ejs', {encoding: 'utf-8'}, function(err, filestring){
  var options={
                host: 'localhost',
                port:  3000,
                path: '/wgs/1/einkaufsliste',
                method: 'POST',
                contenttype: 'application/json'
              }
  
  
  var name={"name": req.body.name};
    //Ausgabe {"name": hier}
    console.log(req.body);
    request.post(
      'http://localhost:3000/wgs/1/einkaufsliste', {
          json: name
      , }
      , function (error, response, body) {
          if (!error && response.statusCode == 201) {
             var datenbody=body;
              var zutatdata=parseInt(datenbody[0]);
              console.log(zutatdata);
              var html=ejs.render(filestring, {zutatdata: zutatdata});
                      res.setHeader("content-type", "text/html");
                      res.writeHead(200);
                      res.write(html);
                      res.end();
          }
          else {
              handleInternalError(req, res);
          };
      });
});
});
app.put('/wgs/1/einkaufsliste/:listid', function(req, res) {

  console.log("listID:"+req.params.listid);
  var options={
                host: 'localhost',
                port:  3000,
                path: '/wgs/1/einkaufsliste/'+req.params.listid,
                method: 'PUT',
                contenttype: 'application/json'
              }

  var externalRequest=http.request(options, function(externalResponse){
      externalResponse.on("data", function(chunk){
      console.log(chunk+" hinzufügen");
      res.send(chunk);
      res.end();
      });
  });
      externalRequest.setHeader("content-type", "application/json");
					 							externalRequest.write(JSON.stringify(req.body));
					 							console.log("Liste wurde überarbeitet:"+req.body);
					 							externalRequest.end();     
});

//____________________________________________________//
//_______________Einkaufslisten_______________________//
app.get('/wgs/1/einkaufsliste', jsonParser, function(req,res){
    fs.readFile('./views/einkaufsliste.ejs', {encoding: 'utf-8'}, function(err, filestring){
        if (err){
            throw err;

        } else {
            var options={
                host: 'localhost',
                port:3000,
                path: '/wgs/1/einkaufsliste',
                method: 'GET',
                headers: {
                accept: 'application/json'
                }
            }
           }

            var externalRequest=http.request(options, function(externalResponse){
                console.log('Connected');
                externalResponse.on("data", function(chunk){
                    var einkaufslistedata=JSON.parse(chunk);
                    console.log(JSON.parse(chunk));
                    var html=ejs.render(filestring, {einkaufslistedata: einkaufslistedata});
                    res.setHeader('content-type', 'text/html');
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
    });
});

app.get("/wgs/1/einkaufsliste/:listid", function(req,res){
    fs.readFile("./views/singleinkaufsliste.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/wgs/1/einkaufsliste/"+req.params.listid,
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }

            var einkaufsliste="";

            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach Einkaufsliste"+req.params.listid+" gesucht");
                if(externalResponse.statusCode === 404){
                    console.log("404 - Rezept not found");
                  //  res.render('main.html');
                }
                    externalResponse.on("data", function(chunk){
                        einkaufsliste = JSON.parse(chunk);
                        console.log(einkaufsliste);
                        var html = ejs.render(filestring, {einkaufsliste: einkaufsliste});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
            });
            externalRequest.end();
        }

});
});

app.post("/wgs/:id/einkaufsliste/:listid", function(req,res){
    console.log(req.params.listid);
            var options = {
                host: "localhost",
                port: 3000,
                path: "/wgs/"+req.params.id+"/einkaufsliste/"+req.params.listid,
                method: "DELETE",
                headers : {
                    accept : "application/json"
                }
            }

            var einkaufsliste;

            var externalRequest = http.request(options, function(externalResponse){

                    externalResponse.on("data", function(chunk){
                        console.log("body: "+chunk)
                        fs.readFile('./views/delListe.ejs', function(err, page) {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(page);
                        res.end();
                        });
                    });
                });
            externalRequest.end();
});

app.get('/wgs/:id/liste', function(req, res){
	fs.readFile('./views/addListe.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
//________________________________________________________//
//________________________________________________________//
app.listen(3001, function(){
console.log("Server listens on Port 3001");
})
