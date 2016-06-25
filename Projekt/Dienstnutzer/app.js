var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var http=require('http');
var ejs=require('ejs');
var fs=require('fs');



app.get('/', function(req, res){
 fs.readFile('./Pages/main.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    }); 
});
//Get auf alle Rezepte
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
    fs.readFile("./Pages/rezept.ejs", {encoding:"utf-8"}, function(err, filestring){
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
                  //  res.render('main.html');
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
           
            var erfolg="";
            var externalRequest = http.request(options, function(externalResponse){
              
                    externalResponse.on("data", function(chunk){
                        console.log("body: "+chunk)
                        fs.readFile('./Pages/delRezept.ejs', function(err, page) {
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
	fs.readFile('./Pages/addRezept.ejs', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    }); 
});
/*
app.post('/rezepte', function(req, res){
    fs.readFile("./Pages/addRezept.ejs", {encoding:"utf-8"}, function(err, filestring){
        var newRezept=req.body;
    if (err){
        throw err;
    } else{
        var options = {
			host: 'localhost',
			port: 3000,
			path: '/addRezept',
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
            form: { 'name': 'xxxx', 'description':'yyyy'}
		}
        var externalRequest = http.request(options, function(externalResponse){   
            console.log("post rezept");
            externalResponse.on("data", function(chunk){
                newRezept=JSON.parse(chunk);
                console.log(newRezept);
                var html=ejs.render(filestring, {rezept: newRezept, filename: "./Pages/addRezept.ejs"});
                res.setHeader("content-type", "text/html");
                res.writeHead(200);
                res.write(html);
                res.end();
            });
        });
        externalRequest.setHeader("content-type", "application.json");
        //externalRequest.write(JSON.stringify(req.body));
        externalRequest.end();
        }
    });
});
      
*/
//____________________________________________________//
//_______________Einkaufslisten_______________________//
//TODO: listid ist falsch, immer auf 0 gesetzt, siehe Dienstgeber
app.get('/wgs/1/einkaufsliste', jsonParser, function(req,res){
    fs.readFile('./Pages/einkaufsliste.ejs', {encoding: 'utf-8'}, function(err, filestring){
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
    fs.readFile("./Pages/singleinkaufsliste.ejs", {encoding:"utf-8"}, function(err, filestring){
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
                        //console.log(einkaufsliste);
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
                        fs.readFile('./Pages/delListe.ejs', function(err, page) {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(page);
                        res.end();
                        }); 
                    });
                });
            externalRequest.end();
});

app.get('/wgs/:id/addListe', function(req, res){	
	fs.readFile('./Pages/addListe.ejs', function(err, page) {
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