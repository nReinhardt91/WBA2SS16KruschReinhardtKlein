var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var http=require('http');
var ejs=require('ejs');
var fs=require('fs');

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
// TODO: das Rezept wird geloescht, bleibt allerdings auf der Seite... wohin als naechstes. Ausgabe ob erfolgreich geloescht wurde oder nicht
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

app.get('/addRezept', function(req, res){	
	fs.readFile('./views/addRezept.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    }); 
});

app.get('/rezepte/:id/zutatenliste', function(req, res){	
	fs.readFile('./views/addZutatenliste.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    }); 
});
//---------------------------------------------//
//---------------------------------------------//
// sofunktioniert es nur teilweise//
app.post('/rezepte', function(req, res) {
fs.readFile('./views/addRezept.ejs', {encoding: 'utf-8'}, function(err, filestring){
  var options={
                host: 'localhost',
                port:  3000,
                path: '/rezepte',
                method: 'POST',
                contenttype: 'application/json'
              }

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
              
             var html=ejs.render(filestring, {rezeptedata: rezeptedata});
                      res.setHeader("content-type", "text/html");
                      res.writeHead(200);
                      res.write(html);
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
//TODO Fehlerhaft
app.put('/wgs/1/einkaufsliste/:listid', function(req, res) {
    fs.readFile('./views/addListe.ejs', {encoding: 'utf-8'}, function(err, filestring){
  console.log(req.params.listid);
  var options={
                host: 'localhost',
                port:  3000,
                path: '/wgs/1/einkaufsliste/'+listid,
                method: 'PUT',
                contenttype: 'application/json'
              }
    var zutat=[req.body.zutat];
        
    console.log("blabla"+req.body);
    console.log(req.body.zutat);
    request.post(
      'http://localhost:3000/wgs/1/einkaufsliste/'+listid, {
          json: zutat
      , }
      , function (error, response, body) {
          if (!error && response.statusCode == 201) {
              var zutatlisteID=body;
              console.body("hier:"+zutatlisteID);
              var html=ejs.render(filestring, {zutatlisteID: zutatlisteID});
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
//____________________________________________________//
//_______________Einkaufslisten_______________________//
//TODO: listid ist falsch, immer auf 0 gesetzt, siehe Dienstgeber
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
                    console.log(einkaufslistedata);                
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

app.get('/wgs/:id/addListe', function(req, res){
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