var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1')
const fs = require('fs')
const YAML = require('yaml')
var path = require('path');
const { execSync } = require("child_process");

var firstBoot = true;
const nSamplesCalibration = 50;

var tresholdK = [ 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9 ];
var touchValues = [ 255, 255, 255, 255, 255, 255, 255, 255];
var touchDelta = [ 0, 0, 0, 0, 0, 0, 0, 0];
var touchTreshold = [ 0, 0, 0, 0, 0, 0, 0, 0];
var touchCalibration = [ 0, 0, 0, 0, 0, 0, 0, 0];
var touchCalibrationCnt = [ 0, 0, 0, 0, 0, 0, 0, 0];


//const configFileName = './calibration.yml';
const configFileName = '/media/usb1/calibration.yml';

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



function getUptime() {
  uptime = execSync("awk '{print $1}' /proc/uptime");
  return parseFloat(uptime);
}

client.on('connect', function () {
  //client.publish('clip', '1');
  client.subscribe('touch/#');
})

client.on('message', function (topic, message) {
  // message is Buffer
  if ( topic.toString().includes("touch/")){
     channel = parseInt(topic.toString().split("touch/")[1]);
     value =  parseInt(message.toString());
     if (channel==0){
/*	console.log("tresholdK", tresholdK);
	console.log("touchValues", touchValues);
	console.log("touchTreshold", touchTreshold);
	console.log("touchCalibration", touchCalibration);
*/
        if (firstBoot == true){
           console.log("calibration");
        } else {
        //   console.log("process");
        }
     }
     touchValues[channel] = value;

     if (firstBoot == true){
        calibration(channel, value);
     } else {
         processTouch(channel, value);
     }
  }
})


function calibration(channel, value){
   if (touchCalibration[channel] < value){
      touchCalibration[channel] = value;
   }
   touchCalibrationCnt[channel]++;
   if (touchCalibrationCnt[channel] > nSamplesCalibration ){
      for ( i = 0; i < 8; i++){
         touchTreshold[i] = parseInt(touchCalibration[i] * tresholdK[i]);
         console.log(i, touchCalibration[i], touchTreshold[i], "\n");
     }
     firstBoot = false;
    // client.publish('clip', '0')
   }
   return 0;
}

function processTouch(channel, value){
  if ( value < touchTreshold[channel]){
     console.log("channel ", channel, " triggered ");
     client.publish('sound/'+ channel, "1");

  } else{
     client.publish('sound/'+ channel, "0")
  }
  return 0;
}

function logValues() {
       console.log("uptime:", getUptime());
      for ( i = 0; i < 8; i++){
//         touchDelta[i] = touchCalibration[i];
         deltaValTrshld = touchValues[i] -touchTreshold[i];
         ratioValCal = parseFloat(touchValues[i]/touchCalibration[i]).toPrecision(2);
         deltaValCalPercentage = parseFloat(ratioValCal - tresholdK[i]).toPrecision(2);
         //ratioValCalTrshldK = parseFloat( tresholdK[i] / ratioValCal ).toPrecision(2);
         console.log(i, touchValues[i], touchCalibration[i], touchTreshold[i], deltaValTrshld, 
                    tresholdK[i], ratioValCal, deltaValCalPercentage);
     }
     console.log('\n');
}

setInterval(logValues, 5000);
