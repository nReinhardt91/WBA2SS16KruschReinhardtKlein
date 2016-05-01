// JavaScript Document
var fs = require('fs');
var chalk = require('chalk');
var chalk_yellow=chalk.yellow;
var chalk_cyan=chalk.cyan;
var chalk_magenta=chalk.magenta;

var obj;
fs.readFile("wolkenkratzer.json", "utf8", function (err, data) {
	if (err) throw err;
	obj = JSON.parse(data);
	
	console.log("Die Wolkenkratzer sind: ");
	for ( var x=0; x<obj.wolkenkratzer.length; x++)
	{
		console.log(chalk_yellow("Name: "+obj.wolkenkratzer[x].name));
		console.log(chalk_cyan("Stadt: "+obj.wolkenkratzer[x].stadt));
		console.log(chalk_magenta("Hoehe: "+obj.wolkenkratzer[x].hoehe));
		console.log("---------------------------------------------");
	}
});