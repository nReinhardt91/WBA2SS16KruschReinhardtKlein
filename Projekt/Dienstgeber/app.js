// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');
var db=redis.createClient();
var app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var uri;


//Rezept hinzufügen
app.post('/rezepte', function(req, res){
    
    var newRezept = req.body;
    
    db.incr('id:rezepte', function(err, rep){
        newRezept.id = rep;
        
        db.set('rezepte:'+newRezept.id, JSON.stringify(newRezept), function(err, rep){
             res.status(200).send(newRezept);
        });
    });
});

//Einzelnes Rezept ausgeben
//Auf PUT stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag
//wird angezeigt
app.get('/rezepte/:id', function(req, res){
    
    db.get('rezepte:'+req.params.id, function(err, rep){
        if(rep){
            res.status(200).type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Das Rezept mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});



//Alle Rezepte ausgeben
app.get('/rezepte', function(req, res){

    db.keys('rezepte:*', function(err, rep){
       if(rep){
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
                uris.push({"uri": "http://localhost:3001/rezepte/"+_json.id, "name": _json.name});
            });

            rezepte = rezepte.map(function(rezept){
                return {id: rezept.id, name: rezept.name, uris};

                  });
            res.status(200).json(uris);
        }); 
           
       }else{
                res.status(404).type('text').send('Liste konnte nicht erstellt werden.');
                }
        
    
    });

});


//Rezept löschen
//Auf DELETE stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag //wurde dann gelöscht
app.delete('/rezepte/:id', function(req, res){

    db.get('rezepte:'+req.params.id, function(err, rep){
        if(rep){
            db.del('rezepte:'+req.params.id, function(err, rep){
                if (rep==1){
                res.status(200).type('text').send('Rezept geloescht');
                }
        else {
            res.status(404).type('text').send('Rezept nicht gefunden');
        }
        });
    }
    });

});
//Rezept ändern
//Auf PUT stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag
//bei Body was ändern, Änderung wird dann angezeigt.
app.put('/rezepte/:id', function(req, res){
    db.exists('rezepte:'+req.params.id, function(err, rep) {
        if (rep == 1) {
            var updateRezept = req.body;
            updateRezept.id = req.params.id;
            db.set('rezepte:' + req.params.id, JSON.stringify(updateRezept), function(err, rep){
                res.status(200).json(updateRezept);
            });
        }
        else {
            res.status(404).type('text').send('Das Rezept wurde nicht gefunden');
        }
    });
});
/*----------------------------------------*/
/*------------Zutatenliste----------------*/
app.post('/rezepte/:id/zutatenliste', function(req, res){
    console.log("POST zutatenliste");
    var listid=parseInt(req.params.id);
    var newList = req.body;
    var neueID="zutatenliste:"+listid;
    var uri="http://localhost:3000/rezepte/"+listid+"/zutatenliste";
    db.rpush(neueID, JSON.stringify(newList), function(err, rep){
            res.status(201).json(uri);
    });
});

app.get('/rezepte/:id/zutatenliste', function(req, res){
    var listid=parseInt(req.params.id);
        db.exists('zutatenliste:'+listid, function(err, reply) {
            if (reply === 1) {
                db.lrange('zutatenliste:'+listid, 0, -1, function(requ, resp){
                console.log(resp);
                res.status(200).json(resp);
                });
            } else {
                
                console.log('nicht vorhanden');
                res.status(404).type('text').send("Zutatenliste existiert nicht");
            }
            });
});

app.delete('/rezepte/:id/zutatenliste', function(req, res){
    var listid=parseInt(req.params.id);
    db.lrange('zutatenliste:'+listid, 0, -1, function(req, reply){
        if(reply){
            db.del('zutatenliste:'+listid, function(err, rep){
                res.status(200).type('text').send('Zutatenliste mit der ID '+listid+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('Zutatenliste nicht gefunden');
        }
    });

});

/*----------------------------------------*/
/*-----------------WG---------------------*/
/*GET: gibt eine WG aus --> ID, Name und Strasse*/
/*  Beispiel URI: http:/localhost:3000/wg/1  */
app.get('/wgs/:id', function(req, res){

    db.get('wgs:'+req.params.id, function(err, rep){
        if(rep){
            res.status(200).type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Die WG mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});

/*POST: legt eine WG an*/
/*  Beispiel: URI http:/localhost:3000/wg */
app.post('/wgs', function(req, res){

    var newWG = req.body;

    db.incr('id:wgs', function(err, rep){

        newWG.id = rep;
        uri="http://localhost:3000/wgs/"+newWG.id;
        db.set('wgs:'+newWG.id, JSON.stringify(newWG), function(err, rep){
            res.status(201).send(uri);
        });
    });

});

/*DELETE: löscht eine WG*/
/*  Beispiel: URI http:/localhost:3000/wg/1 */
app.delete('/wgs/:id', function(req, res){

    db.get('wgs:'+req.params.id, function(err, rep){
        if(rep){
            db.del('wgs:'+req.params.id, function(err, rep){
                res.status('200').type('text').send('WG mit der ID '+req.params.id+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('WG nicht gefunden');
        }
    });

});

/*-----*/
/*POST: einer WG eine Einkaufsliste hinzufügen*/
/* Rückgabe bisher ganzes Objekt  (wie kann man in eine Liste einfügen)*/
app.post('/wgs/:id/einkaufsliste', function(req, res){
    var wgID=parseInt(req.params.id);
    var newList = req.body;
    console.log(newList);
    db.incr('id:einkaufsliste', function(err, rep){
        newID = rep;
        newListhole=newList;
        newListhole.id=rep;
        db.rpush('einkaufsliste:'+rep, JSON.stringify(newID),function(err, rep){ });
        db.rpush('einkaufsliste:'+rep, JSON.stringify(newList), function(err, rep){
        });
        db.lrange('einkaufsliste:'+rep, 0, -1, function(requ, resp){
                console.log(resp);
                res.status(201).json(resp);
                });
    });
});

app.post('/wgs/:id/einkaufsliste/:listid', function(req, res){
    var listid=parseInt(req.params.listid);
    var wgID=parseInt(req.params.id);
    var newList = JSON.stringify(req.body);
    var uri="http://localhost:3000/wgs/"+wgID+"/einkaufsliste/"+listid;
    db.rpush('einkaufsliste'+listid, newList, function(err, rep){
    });
    db.lrange('einkaufsliste:'+listid, 0, -1, function(requ, resp){
                console.log(resp);
                res.status(200).json(resp);
                });
});

//TODO: nur ID zurück??
app.put('/wgs/:id/einkaufsliste/:listid', function(req, res){
    db.exists('einkaufsliste:'+req.params.listid, function(err, rep) {
        if (rep == 1) {
            var updateListe = req.body;
            console.log(req.body);
            console.log(req.params.listid);
            db.rpush('einkaufsliste:'+req.params.id, JSON.stringify(updateListe), function(err, rep){
                res.status(200).json(updateListe);
            });
        }
        else {
            res.status(404).type('text').send('Die Liste wurde nicht gefunden und konnte nicht geupdatet werden.');
        }
    });
});

//alle Einkaufslisten ausgeben lassen
//TODO: listid ist falsch, immer auf 0 gesetzt, siehe Dienstgeber
//app.get('/wgs/:id/einkaufsliste', function(req, res){
//        var wgid=req.params.id;
//    db.keys('einkaufsliste:*', function(err, rep){
//        var einkaufslisten = [];
//        var uris=[];
//        if (rep.length == 0) {
//            res.json(einkaufslisten);
//            return;
//        }
//            rep.forEach(function(val){
//               _json = JSON.parse(val);
//          //      console.log(_json);
//                einkaufslisten.push(JSON.parse(val));
//                uris.push({"uri": "http://localhost:3001/wgs/1/einkaufsliste/"+val.listid});
//                einkaufslisten.push(val);
//                console.log(uris);
//            });
//                
//                
//            einkaufslisten = einkaufslisten.map(function(einkaufsliste){
//                return {listid: einkaufslisten.listid, name: einkaufslisten.name, uris};
//                  });
//            res.json(uris);
//        });
//});
//TODO: Listenid zurckgeben
app.get('/wgs/:id/einkaufsliste', function(req, res){

    db.keys('einkaufsliste:*', function(err, resp){
       if(resp){
           var liste = [];

        if (resp.length == 0) {
            res.json(liste);
            return;
        }
        var uris=[];

        db.mget(resp, function(err, rep){

            rep.forEach(function(val){
               console.log(val);
                _json = JSON.parse(val);
                liste.push(JSON.parse(val));
                uris.push({"uri": "http://localhost:3001/wgs/1/einkaufsliste/??" });
            });

            liste = liste.map(function(rezept){
                return {id: liste.id, name: liste.name, uris};

                  });
            res.status(200).json(uris);
        }); 
           
       }else{
                res.status(404).type('text').send('Liste konnte nicht gefunden werden.');
                }
        
    
    });

});
/*GET: eine Einkaufsliste ausgeben*/
app.get('/wgs/:id/einkaufsliste/:listid', function(req, res){
    var listid=parseInt(req.params.listid);
    console.log("hier"+listid);
        db.exists('einkaufsliste:'+listid, function(err, reply) {
            if (reply === 1) {
                db.lrange('einkaufsliste:'+listid, 0, -1, function(requ, resp){
                console.log(resp);
                res.status(200).json(resp);
                });
            } else {
                console.log('nicht vorhanden');
                res.status(404).type('text').send("Einkaufsliste existiert nicht");
            }
            });
});

/*DELETE: eine Einkaufsliste löschen*/
app.delete('/wgs/:id/einkaufsliste/:listid', function(req, res){
    var listid=parseInt(req.params.listid);
    db.lrange('einkaufsliste:'+listid, 0, -1, function(req, reply){
        if(reply){
            db.del('einkaufsliste:'+listid, function(err, rep){
                res.status(200).type('text').send('Einkaufsliste mit der ID '+listid+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('Einkaufsliste nicht gefunden');
        }
    });

});

/*----------------------------------------*/
/*----------------Zutat-------------------*/

//Zutat hinzufügen
app.post('/zutaten', function(req, res){
    var newZutat = req.body;
    db.incr('id:zutaten', function(err, rep){
        newZutat.id = rep;
        uri="http://localhost:3000/zutaten/"+newZutat.id;
        db.set('zutaten:'+newZutat.id, JSON.stringify(newZutat), function(err, rep){
            if(rep){
                res.status(201).send(uri);
            } else {
                res.status(404).type('text').send('Konnte Zutaten nicht hinzufügen');
            }
                
        });
    });

});
//Einzelne Zutat ausgeben
//Auf PUT stellen und oben http:/localhost:3000/zutat/ <-- hier die ID eintragen bsp(http:/localhost:3000/zutat/2) Eintrag
//wird angezeigt
app.get('/zutaten/:id', function(req, res){
    db.get('zutaten:'+req.params.id, function(err, rep){
        if(rep){
            res.status(200).type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Die Zutat mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});

//Alle Zutaten ausgeben
app.get('/zutaten', function(req, res){
    db.keys('zutaten:*', function(err, rep){
        var zutaten = [];
        if (rep.length == 0) {
            res.json(zutaten);
            return;
        }
        var uris=[];
        var rid=rep;
       /* rep.forEach(function(err, test){
            uris.push("http://localhost:3000/rezepte/"+rep.id);
        });*/
        db.mget(rep, function(err, rep){
            rep.forEach(function(val){
                zutaten.push(JSON.parse(val));
                uris.push("http://localhost:3000/zutaten/");
            });
                zutaten = zutaten.map(function(rezept){
                return {id: zutaten.id, name: zutaten.name};
            });
            res.status(200).json(uris);
        });
    });

});


//Zutat löschen
//Auf DELETE stellen und oben http:/localhost:3000/zutat/ <-- hier die ID eintragen bsp(http:/localhost:3000/zutat/2) Eintrag //wurde dann gelöscht
app.delete('/zutaten/:id', function(req, res){

    db.get('zutaten:'+req.params.id, function(err, rep){
        if(rep){
            db.del('zutaten:'+req.params.id, function(err, rep){
                res.status(200).type('text').send('Zutat mit der ID '+req.params.id+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('Zutat nicht gefunden');
        }
    });

});
//Zutat ändern
//Auf PUT stellen und oben http:/localhost:3000/zutat/ <-- hier die ID eintragen bsp(http:/localhost:3000/zutat/2) Eintrag
//bei Body was ändern, Änderung wird dann angezeigt.
app.put('/zutaten/:id', function(req, res){
    db.exists('zutaten:'+req.params.id, function(err, rep) {
        if (rep == 1) {
            var updateZutat = req.body;
            updateZutat.id = req.params.id;
            db.set('zutaten:' + req.params.id, JSON.stringify(updateZutat), function(err, rep){
                res.status(200).json(updateZutat);
            });
        }
        else {
            res.status(404).type('text').send('Die Zutat wurde nicht gefunden');
        }
    });
});
app.listen(3000);
