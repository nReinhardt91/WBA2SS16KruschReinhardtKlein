// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');

var db=redis.createClient();

var app=express();
app.use(bodyParser.json());

var uri;


//Rezept hinzufügen
app.post('/rezepte', function(req, res){

    var newRezept = req.body;

    db.incr('id:rezepte', function(err, rep){

        newRezept.id = rep;
        uri="http://localhost:3000/rezepte/"+newRezept.id;
        db.set('rezept:'+newRezept.id, JSON.stringify(newRezept), function(err, rep){
            res.send(uri);
        });
    });

});
//Einzelnes Rezept ausgeben
//Auf PUT stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag
//wird angezeigt
app.get('/rezepte/:id', function(req, res){

    db.get('rezept:'+req.params.id, function(err, rep){
        if(rep){
            res.type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Das Rezept mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});
//Nur Beschreibung ausgeben
//app.get('/rezepte/:id/name', function(req,res){
//
//        db.hget('rezept:'+req.params.id+'/'+req.params.name, function(err, rep){
//            if(rep){
//                res.type('json').send(rep);
//            }
//            else {
//                res.status(404).type('text').send('Das Rezept mit dem Namen ' +req.params.name+' wurde nicht gefunden');
//            }
//        });
//
//
//});
//


//Alle Rezepte ausgeben
app.get('/rezepte', function(req, res){
    
    db.keys('rezept:*', function(err, rep){
        var rezepte = [];

        if (rep.length == 0) {
            res.json(rezepte);
            return;
        }
        var uris=[];
        var rid=rep;
       /* rep.forEach(function(err, test){
            uris.push("http://localhost:3000/rezepte/"+rep.id);
        });*/
        
        db.mget(rep, function(err, rep){
            
            rep.forEach(function(val){
                rezepte.push(JSON.parse(val));
                uris.push("http://localhost:3000/rezepte/");
                
            });

            rezepte = rezepte.map(function(rezept){
                return {id: rezept.id, name: rezept.name};
                
            });
            res.json(rezepturi);
        });
    });

});


//Rezept löschen
//Auf DELETE stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag //wurde dann gelöscht
app.delete('/rezepte/:id', function(req, res){

    db.get('rezept:'+req.params.id, function(err, rep){
        if(rep){
            db.del('rezept:'+req.params.id, function(err, rep){
                res.type('text').send('Rezept mit der ID '+req.params.id+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('Rezept nicht gefunden');
        }
    });

});
//Rezept ändern
//Auf PUT stellen und oben http:/localhost:3000/rezepte/ <-- hier die ID eintragen bsp(http:/localhost:3000/rezepte/2) Eintrag
//bei Body was ändern, Änderung wird dann angezeigt.
app.put('/rezepte/:id', function(req, res){
    db.exists('rezept:'+req.params.id, function(err, rep) {
        if (rep == 1) {
            var updateRezept = req.body;
            updateRezept.id = req.params.id;
            db.set('rezept:' + req.params.id, JSON.stringify(updateRezept), function(err, rep){
                res.json(updateRezept);
            });
        }
        else {
            res.status(404).type('text').send('Das Rezept wurde nicht gefunden');
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
            res.type('json').send(rep);
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
            res.send(uri);
        });
    });

});

/*DELETE: löscht eine WG*/
/*  Beispiel: URI http:/localhost:3000/wg/1 */
app.delete('/wgs/:id', function(req, res){

    db.get('wgs:'+req.params.id, function(err, rep){
        if(rep){
            db.del('wgs:'+req.params.id, function(err, rep){
                res.type('text').send('WG mit der ID '+req.params.id+' wurde gelöscht');
            });
        }
        else {
            res.status(404).type('text').send('WG nicht gefunden');
        }
    });

});

/*-----*/
/*POST: einer WG eine Einkaufsliste hinzufügen*/
/*TODO: beendet den Vorgang nicht, legt aber die neue Liste an*/
app.post('/wgs/:id/einkaufsliste', function(req, res){
    var wgID=parseInt(req.params.id);
    var newList = req.body;

    db.incr('id:einkaufsliste', function(err, rep){
        newList.id = rep;
        
        db.rpush('einkaufsliste:'+newList.id, JSON.stringify(newList), function(err, rep){
            res.json(newList);
        });
    });
});

/*GET: eine Einkaufsliste ausgeben*/
/*TODO: Ausgabe korrigieren, Name der Liste nicht als Menge aber Zutaten als Menge??*/
app.get('/wgs/:id/einkaufsliste/:listid', function(req, res){
    var listid=parseInt(req.params.listid);
        db.exists('einkaufsliste:'+listid, function(err, reply) {
            if (reply === 1) {
                db.lrange('einkaufsliste:'+listid, 0, -1, function(req, res){
                console.log(res);
                });
            } else {
                console.log('nicht vorhanden');
            }
            });
});

/*DELETE: eine Einkaufsliste löschen*/
app.delete('/wgs/:id/einkaufsliste/:listid', function(req, res){
    var listid=parseInt(req.params.listid);
    db.lrange('einkaufsliste:'+listid, 0, -1, function(req, reply){
        if(reply){
            db.del('einkaufsliste:'+listid, function(err, rep){
                res.type('text').send('Einkaufsliste mit der ID '+listid+' wurde gelöscht');
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
            res.send(uri);
        });
    });

});
//Einzelne Zutat ausgeben
//Auf PUT stellen und oben http:/localhost:3000/zutat/ <-- hier die ID eintragen bsp(http:/localhost:3000/zutat/2) Eintrag
//wird angezeigt
app.get('/zutaten/:id', function(req, res){

    db.get('zutaten:'+req.params.id, function(err, rep){
        if(rep){
            res.type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Die Zutat mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});
//Nur Beschreibung ausgeben
//app.get('/rezepte/:id/name', function(req,res){
//
//        db.hget('rezept:'+req.params.id+'/'+req.params.name, function(err, rep){
//            if(rep){
//                res.type('json').send(rep);
//            }
//            else {
//                res.status(404).type('text').send('Das Rezept mit dem Namen ' +req.params.name+' wurde nicht gefunden');
//            }
//        });
//
//
//});
//


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
            res.json(uris);
        });
    });

});


//Zutat löschen
//Auf DELETE stellen und oben http:/localhost:3000/zutat/ <-- hier die ID eintragen bsp(http:/localhost:3000/zutat/2) Eintrag //wurde dann gelöscht
app.delete('/zutaten/:id', function(req, res){

    db.get('zutaten:'+req.params.id, function(err, rep){
        if(rep){
            db.del('zutaten:'+req.params.id, function(err, rep){
                res.type('text').send('Zutat mit der ID '+req.params.id+' wurde gelöscht');
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
                res.json(updateZutat);
            });
        }
        else {
            res.status(404).type('text').send('Die Zutat wurde nicht gefunden');
        }
    });
});
app.listen(3000);
