// das Programm hier
var express= require('express');
var bodyParser=require('body-parser');
var redis=require('redis');
var db=redis.createClient();

var app=express();
app.use(bodyParser.json());


//Rezept hinzufügen
app.post('/rezepte', function(req, res){
    
    var newRezept = req.body;
    
    db.incr('id:rezepte', function(err, rep){
        
        newRezept.id = rep;
        
        db.set('rezept:'+newRezept.id, JSON.stringify(newRezept), function(err, rep){
            res.json(newRezept);
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
        
        db.mget(rep, function(err, rep){
            
            rep.forEach(function(val){
                rezepte.push(JSON.parse(val));     
            });
            
            rezepte = rezepte.map(function(rezept){
                return {id: rezept.id, name: rezept.name};
            });
            
            res.json(rezepte);
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

/* ---------------------------------------------WG--------------------------------------- */
/*GET: gibt eine WG aus*/
app.get('/wg/:id', function(req, res){
    
    db.get('wg:'+req.params.id, function(err, rep){
        if(rep){
            res.type('json').send(rep);
        }
        else{
            res.status(404).type('text').send('Die WG mit der ID ' +req.params.id+' wurde nicht gefunden');
        }
    });
});

/*POST: legt eine WG an*/
app.post('/wg', function(req, res){
    
    var newWG = req.body;
    
    db.incr('id:wg', function(err, rep){
        
        newWG.id = rep;
        
        db.set('wg:'+newWG.id, JSON.stringify(newWG), function(err, rep){
            res.json(newWG);
        });
    });
    
});

/*DELETE: löscht eine WG*/
app.put('/wg/:id', function(req, res){
    db.exists('wg:'+req.params.id, function(err, rep) {
        if (rep == 1) {
            var updateWG = req.body;
            updateWG.id = req.params.id;
            db.set('wg:' + req.params.id, JSON.stringify(updateWG), function(err, rep){
                res.json(updateWG);
            });
        }
        else {
            res.status(404).type('text').send('Die WG wurde nicht gefunden');
        }
    });
});
app.listen(3000);