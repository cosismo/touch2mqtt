const fs = require('fs')
const YAML = require('yaml')
var path = require('path');

//const configFileName = './calibration.yml';
const configFileName = '/media/usb1/calibration.yml';

var tresholdK = [ 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9 ];
try {
  if (fs.readFileSync(configFileName, 'utf8')) {
    var file = fs.readFileSync(configFileName, 'utf8') 
    var  tresholdKObj = YAML.parse(file);
    tresholdK = Object.values(tresholdKObj);

  }
} catch(err) {
    console.log("No config file, setting senstivity to 0.7"); 
}

    console.log (tresholdK);

