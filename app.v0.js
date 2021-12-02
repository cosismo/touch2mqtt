var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.10.104')

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
  }
})
