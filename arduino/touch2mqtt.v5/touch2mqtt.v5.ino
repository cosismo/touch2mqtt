#include <WiFi.h>
#include <PubSubClient.h>

// Replace the next variables with your SSID/Password combination
//const char* ssid = "videosync";
//const char* password = "andromeda6w4{q/U7,Q,Gc4*^";
const char* ssid = "montdraco";
const char* password = "andromedaA#0";
// Add your MQTT Broker IP address, example:
const char* mqtt_server = "192.168.4.99";
//const char* mqtt_server = "192.168.10.100";
//const char* mqtt_server = "YOUR_MQTT_BROKER_IP_ADDRESS";



WiFiClient espClient;
PubSubClient client(espClient);

//char msg[50];

bool firstBoot = true;
// LED Pin
const int ledPin = 4;
const char *topicPrefix = "touch/";
char touchValueBytes[10];
const int NSAMPLES = 25;

int touchPin[] = {4, 15, 13, 12, 14, 27, 33, 32};
int touchValue[] = {0, 0, 0, 0, 0, 0, 0, 0};
int touchLastSample;
int touchCurrentSample;




void setup() {
  Serial.begin(115200);

  setup_wifi();
  client.setServer(mqtt_server, 1883);


  pinMode(ledPin, OUTPUT);
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
      // Subscribe
      client.subscribe("esp32/output");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void readTouch() {
  for (int i = 0; i < 8; i++) {
    touchLastSample = 0;
    for (int j = 0; j < NSAMPLES; j++) {
      touchCurrentSample = touchRead(touchPin[i]);
      touchCurrentSample = max(touchCurrentSample, touchLastSample);
      touchLastSample = touchCurrentSample;
      /*Serial.println(touchCurrentSample);
      delay(1); */
    }
    /*
    Serial.println("touchLastSample: ");
    Serial.println(touchLastSample);
    Serial.println("i: ");
    Serial.println(i);
    Serial.println("");
    delay(3000);
    */
    touchValue[i] = touchLastSample;
  }
}
void publishTouch() {
  for (int i = 0; i < 8; i++) {
    char channelStr [5];
    char topic[20];
    sprintf(channelStr, "%d", i);
    strcpy(topic, topicPrefix);
    strcat(topic, channelStr);
    sprintf(touchValueBytes, "%d", touchValue[i] );
    Serial.print(topic);
    Serial.print(" ");
    Serial.print(touchValue[i]);
    Serial.print("  ");
    client.publish(topic, touchValueBytes);
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  readTouch();

  if (firstBoot == true) {
    firstBoot = false;
    delay(1000);
  } else {
    publishTouch();
  }


  Serial.println(" ");

  //delay(10);
}
