var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1')
var firstBoot = true;

var touchValues = [ 255, 255, 255, 255, 255, 255, 255, 255];

var tresholdK = [ 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
var touchTreshold = [ 0, 0, 0, 0, 0, 0, 0, 0];
var touchCalibration = [ 0, 0, 0, 0, 0, 0, 0, 0];
var touchCalibrationCnt = [ 0, 0, 0, 0, 0, 0, 0, 0];


client.on('connect', function () {
  client.publish('clip', '1');
  client.subscribe('touch/#');
})

client.on('message', function (topic, message) {
  // message is Buffer
  if ( topic.toString().includes("touch/")){
     channel = parseInt(topic.toString().split("touch/")[1]);
     value =  parseInt(message.toString());
     console.log (channel, value);
     if (firstBoot == true){
        calibration(channel, value);
     } else {
         processTouch(channel, value);
     }
  }
})


function calibration(){
   console.log("cal");
   touchCalibration[channel] += value;
   touchCalibrationCnt[channel]++;
   if (touchCalibrationCnt[channel] > 20 ){
      console.log("Calibration\n");
      for ( i = 0; i < 8; i++){
         touchCalibration[i] = parseInt(touchCalibration[i] / touchCalibrationCnt[i]);
         touchTreshold[i] = parseInt(touchCalibration[i] * tresholdK[i]);
         console.log(i, touchCalibration[i], touchTreshold[i], "\n");
     }
     firstBoot = false;
     client.publish('clip', '0')
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

