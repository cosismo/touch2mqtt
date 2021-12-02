var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.10.104')
var firstBoot = false;

var touchValues = [ 255, 255, 255, 255, 255, 255, 255, 255];
var touchTreshold = [ 55, 55, 55, 55, 55, 55, 55, 55];

client.on('connect', function () {
  client.subscribe('touch/#');
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  if ( topic.toString().includes("touch/")){
     channel = parseInt(topic.toString().split("touch/")[1]);
     value =  parseInt(message.toString());
     console.log (channel, value);
     if (firstBoot){
        calibration();
     } else {
         processTouch(channel, value);
     }
  }
})


function calibration(){

  return 0;
}

function processTouch(channel, value){
  if ( value < touchTreshold[channel]){
     console.log("channel ", channel, " triggered ");
  }
  return 0;
}

