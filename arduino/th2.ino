#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

#define WIFI_SSID     "ToanVY"
#define WIFI_PASSWORD "05022004"

#define MQTT_SERVER   "10.14.65.12"
#define MQTT_PORT     1883
#define MQTT_USER     "toan"
#define MQTT_PASSWORD "12345"

#define TOPIC_A "aaa"
#define TOPIC_SENSOR  "esp32/sensor/data"

#define TOPIC_LIGHT     "esp32/control/light"
#define TOPIC_FAN     "esp32/control/fan"
#define TOPIC_AC      "esp32/control/ac"

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define LDR_PIN 36  //  (VP)

#define LED_LIGHT 25 // Đèn
#define LED_FAN   26 // Quạt
#define LED_AC    27 // ĐH

#define SEND_INTERVAL 3000  // 3 giây

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastSendTime = 0;

void setup_wifi() {
  Serial.print(" Kết nối WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print(" IP ESP32: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String message = String((char*)payload);
  Serial.printf(" Lệnh từ %s: %s\n", topic, message.c_str());

  if (String(topic) == TOPIC_LIGHT) {
    digitalWrite(LED_LIGHT, message == "ON" ? HIGH : LOW);
  } else if (String(topic) == TOPIC_FAN) {
    digitalWrite(LED_FAN, message == "ON" ? HIGH : LOW);
  } else if (String(topic) == TOPIC_AC) {
    digitalWrite(LED_AC, message == "ON" ? HIGH : LOW);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print(" Kết nối MQTT...");
    Serial.print("\n");
    if (client.connect("ESP32Client", MQTT_USER, MQTT_PASSWORD)) {
      client.subscribe(TOPIC_LIGHT);
      client.subscribe(TOPIC_FAN);
      client.subscribe(TOPIC_AC);
    } else {
      Serial.print("  lỗi, rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
} 

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LED_LIGHT, OUTPUT);
  pinMode(LED_FAN, OUTPUT);
  pinMode(LED_AC, OUTPUT);

  digitalWrite(LED_LIGHT, LOW);
  digitalWrite(LED_FAN, LOW);
  digitalWrite(LED_AC, LOW);

  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) { 
    lastSendTime = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int lightValue = analogRead(LDR_PIN);

    if (isnan(h) || isnan(t)) {
      Serial.println(" Lỗi đọc DHT11, bỏ qua lần này");
      return;
    }

    DynamicJsonDocument doc(128);
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["light"] = lightValue;

    char buffer[128];
    serializeJson(doc, buffer);
    client.publish(TOPIC_SENSOR, buffer);
    Serial.println(" Publish: " + String(buffer));
  }
}
