var fs = require('fs');
var obj;
fs.readFile('wolkenkratzer.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);

    console.log("Alle Wolkenkratzer:  ");
    for ( var x=0; x<obj.wolkenkratzer.length; x++)
    {
        console.log("Name:  "+obj.wolkenkratzer[x].name);
        console.log("Stadt:  "+obj.wolkenkratzer[x].stadt);
        console.log("Hoehe:  "+obj.wolkenkratzer[x].hoehe);
        console.log("------------------------------------");
    }
});

//console.log("vielleicht "+obj.wolkenkratzer[0].stadt);