#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// =======================
// WiFi + MQTT Config
// =======================
#define WIFI_SSID     "ToanVY"
#define WIFI_PASSWORD "05022004"

#define MQTT_SERVER   "10.232.235.12"
#define MQTT_PORT     1883
#define MQTT_USER     "toan"
#define MQTT_PASSWORD "12345"

// =======================
// MQTT Topics
// =======================
#define TOPIC_SENSOR  "esp32/sensor/data"

#define TOPIC_LIGHT   "esp32/control/light"
#define TOPIC_FAN     "esp32/control/fan"
#define TOPIC_AC      "esp32/control/ac"

#define TOPIC_CONTROL "controlLED"    
#define TOPIC_LWT     "esp32/status/LWT"
#define TOPIC_ONLINE  "esp32/status/online"

// =======================
// Cảm biến + GPIO
// =======================
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define LDR_PIN 36  

#define LED_LIGHT 25
#define LED_FAN   26
#define LED_AC    27

#define SEND_INTERVAL 3000  

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastSendTime = 0;

// =======================
// Biến trạng thái
// =======================
bool lightState = false;
bool fanState   = false;
bool acState    = false;

// =======================
// WiFi connect
// =======================
void setup_wifi() {
  delay(10);
  Serial.println("🔌 Kết nối WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");
  Serial.print("📡 IP: ");
  Serial.println(WiFi.localIP());
}

// =======================
// Cập nhật trạng thái thiết bị
// =======================
void updateDeviceState(const char* device, bool &currentState, bool newState, int pin) {
  // ✅ Chỉ gửi trạng thái khi MQTT connected
  if (!client.connected()) return;

  if (currentState != newState) {
    currentState = newState;
    digitalWrite(pin, newState ? HIGH : LOW);

    String topic = String("esp32/state/") + device;
    client.publish(topic.c_str(), newState ? "ON" : "OFF", true);

    Serial.printf("📤 Trạng thái %s → %s\n", device, newState ? "ON" : "OFF");
  }
}

// =======================
// Xử lý lệnh MQTT
// =======================
void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String message = String((char*)payload);
  Serial.printf("📩 Lệnh từ %s: %s\n", topic, message.c_str());

  if (String(topic) == TOPIC_LIGHT) {
    updateDeviceState("light", lightState, (message == "ON"), LED_LIGHT);
  } else if (String(topic) == TOPIC_FAN) {
    updateDeviceState("fan", fanState, (message == "ON"), LED_FAN);
  } else if (String(topic) == TOPIC_AC) {
    updateDeviceState("ac", acState, (message == "ON"), LED_AC);
  }
}

// =======================
// Reconnect MQTT
// =======================
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔄 Kết nối MQTT...");
    if (client.connect("ESP32Client", MQTT_USER, MQTT_PASSWORD, TOPIC_LWT, 1, true, "OFFLINE")) {
      Serial.println("✅ MQTT Connected");

      client.subscribe(TOPIC_LIGHT);
      client.subscribe(TOPIC_FAN);
      client.subscribe(TOPIC_AC);
      client.subscribe(TOPIC_CONTROL);

      // Thông báo ESP32 đang online
      client.publish(TOPIC_ONLINE, "ONLINE", true);

      // Gửi yêu cầu server trả lại trạng thái
      client.publish(TOPIC_CONTROL, "GET_STATE");
    } else {
      Serial.print("❌ Lỗi, rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// =======================
// SETUP
// =======================
void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LED_LIGHT, OUTPUT);
  pinMode(LED_FAN, OUTPUT);
  pinMode(LED_AC, OUTPUT);

  setup_wifi();

  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  reconnect();
}

// =======================
// LOOP
// =======================
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
      Serial.println("⚠️ Lỗi đọc DHT11, bỏ qua lần này");
      return;
    }

    DynamicJsonDocument doc(128);
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["light"] = lightValue;

    char buffer[128];
    serializeJson(doc, buffer);

    // ✅ Chỉ publish khi MQTT connected
    if (client.connected()) {
      client.publish(TOPIC_SENSOR, buffer);
      Serial.println("📤 Publish sensor: " + String(buffer));
    }
  }
}
