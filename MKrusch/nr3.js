var fs = require('fs');
var chalk = require('chalk');
var obj;

var chalk_red = chalk.red;
var chalk_green = chalk.green;
var chalk_yellow = chalk.yellow;

fs.readFile('wolkenkratzer.json', 'utf8', function (err, data) {
    if(err) throw err;
    obj =JSON.parse(data);

    console.log("Alle Wolkenkratzer:  ")

    obj.wolkenkratzer.sort(function(a, b){
        return a.hoehe - b.hoehe;
    });

    var file ='wolkenkratzer_sortiert.json';

    for ( var x=0; x<obj.wolkenkratzer.length; x++){

        var objects={
            "name": obj.wolkenkratzer[x].name,
            "stadt": obj.wolkenkratzer[x].stadt,
            "hoehe": obj.wolkenkratzer[x].hoehe
        };

        fs.appendFile(file, JSON.stringify(objects, null, 2));
    }

    for (var x=0; x<obj.wolkenkratzer.length; x++){
        console.log(chalk_red("Name:  "+obj.wolkenkratzer[x].name));
        console.log(chalk_green("Stadt:  "+obj.wolkenkratzer[x].stadt));
        console.log(chalk_yellow("Höhe:  "+obj.wolkenkratzer[x].hoehe));
        console.log("----------------------------------");
    }
});
