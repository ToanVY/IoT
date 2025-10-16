// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mqtt from "mqtt";
import mysql from "mysql2/promise";
import cors from "cors";
import sensorRoutes from "./routes/sensors.js";
import deviceRoutes from "./routes/devices.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ================== MySQL ==================
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "iotdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ================== MQTT ==================
const mqttClient = mqtt.connect("mqtt://10.232.235.12:1883", {
  username: "toan",
  password: "12345",
  will: {
    topic: "esp32/status/LWT",
    payload: "OFFLINE",
    retain: true,
    qos: 1,
  },
});

// Đưa mqttClient, pool, io vào app.locals để controller dùng
app.set("mqttClient", mqttClient);
app.set("db", pool);
app.set("io", io);

// ================== STATE ==================
let isDeviceOnline = false;
let deviceStates = { light: "off", fan: "off", ac: "off" };
let lastKnownStates = { ...deviceStates };

// ================== MQTT EVENTS ==================
mqttClient.on("connect", () => {
  console.log("✅ MQTT Connected");
  mqttClient.subscribe([
    "esp32/status/LWT",
    "esp32/status/online",
    "esp32/state/light",
    "esp32/state/fan",
    "esp32/state/ac",
    "esp32/sensor/data",
    "controlLED",
  ]);
});

mqttClient.on("message", async (topic, message) => {
  const msg = message.toString().toLowerCase();

  if (topic === "esp32/status/LWT" && msg === "offline") {
    console.log("❌ ESP32 OFFLINE");
    isDeviceOnline = false;
    deviceStates = { light: "off", fan: "off", ac: "off" };
    io.emit("deviceStates", deviceStates);
    return;
  }

  if (topic === "esp32/status/online" && msg === "online") {
    console.log("🔌 ESP32 ONLINE");
    isDeviceOnline = true;
    for (const [device, state] of Object.entries(lastKnownStates)) {
      mqttClient.publish(`esp32/control/${device}`, state.toUpperCase(), { retain: true });
    }
    io.emit("deviceStates", deviceStates);
    return;
  }

  if (topic.startsWith("esp32/state/")) {
    const device = topic.split("/")[2];
    const newState = msg;
    deviceStates[device] = newState;
    io.emit("deviceStates", deviceStates);

    if (isDeviceOnline && ["light", "fan", "ac"].includes(device)) {
      if (lastKnownStates[device] !== newState) {
        lastKnownStates[device] = newState;
        try {
          await pool.execute("INSERT INTO Actions (Device, Status) VALUES (?, ?)", [
            device,
            newState.toUpperCase(),
          ]);
          console.log(`💾 DB: ${device} → ${newState.toUpperCase()}`);
        } catch (err) {
          console.error("❌ DB Error:", err);
        }
      }
    }
    return;
  }

  if (topic === "esp32/sensor/data") {
    try {
      const data = JSON.parse(message.toString());
      io.emit("sensorDataUpdate", { ...data, created_at: new Date().toISOString() });
      const { temperature, humidity, light } = data;
      await pool.execute(
        "INSERT INTO Sensors (temperature, humidity, light) VALUES (?, ?, ?)",
        [temperature, humidity, light]
      );
    } catch (err) {
      console.error("❌ Lỗi lưu dữ liệu cảm biến:", err);
    }
    return;
  }

  if (topic === "controlLED" && msg === "get_state") {
    for (const [device, state] of Object.entries(lastKnownStates)) {
      mqttClient.publish(`esp32/control/${device}`, state.toUpperCase(), { retain: true });
    }
    return;
  }
});

// ================== SOCKET.IO ==================
io.on("connection", (socket) => {
  console.log("🔗 Web client connected:", socket.id);
  socket.emit("deviceStates", deviceStates);

  socket.on("controlDevice", ({ device, state }) => {
    if (["light", "fan", "ac"].includes(device)) {
      mqttClient.publish(`esp32/control/${device}`, state.toUpperCase(), { retain: true });
    }
  });
});

// ================== ROUTES ==================
app.use("/api/sensors", sensorRoutes);
app.use("/api/devices", deviceRoutes);

// ================== START SERVER ==================
const PORT = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
