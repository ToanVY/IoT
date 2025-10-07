// backend/server.js

import express from "express";
import dotenv from "dotenv";
import mqtt from "mqtt";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import pool from "./dbConfig.js";
import deviceRoutes from "./routes/devices.js";
import sensorRoutes from "./routes/sensors.js";
import { controlDevice, getActions, updateProfile } from "./controllers/deviceController.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// ================== CẤU HÌNH __dirname TRONG ES MODULE ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CẤU HÌNH MULTER CHO AVATAR ==================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/avatars'));
    },
    filename: (req, file, cb) => {
        const studentId = req.body.studentId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, studentId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ================== CẤU HÌNH SOCKET.IO SERVER ==================
export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`🌐 Frontend client connected: ${socket.id}`);
    // gửi trạng thái thiết bị hiện tại cho client mới kết nối
    socket.emit("deviceStates", deviceStates);
});

// ================== CẤU HÌNH EXPRESS & MIDDLEWARE ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== QUẢN LÝ TRẠNG THÁI THIẾT BỊ ==================
export let deviceStates = {
    light: "off",
    fan: "off",
    ac: "off"
};

// ================== MQTT CLIENT ==================
const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const mqttClient = mqtt.connect(MQTT_URL, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
    console.log("✅ ESP32 Connected to MQTT broker");
    mqttClient.subscribe("esp32/sensor/data", (err) => {
        if (!err) console.log("📡 Subscribed to esp32/sensor/data");
    });

    // khi ESP32 kết nối lại, gửi trạng thái cũ cho frontend
    io.emit("deviceStates", deviceStates);
});

mqttClient.on("offline", () => {
    console.log("⚠️ ESP32 disconnected");
    deviceStates = { light: "off", fan: "off", ac: "off" };
    io.emit("deviceStates", deviceStates);
});

mqttClient.on("error", (err) => {
    console.error("❌ MQTT Error:", err);
    deviceStates = { light: "off", fan: "off", ac: "off" };
    io.emit("deviceStates", deviceStates);
});

mqttClient.on("message", async (topic, message) => {
    try {
        if (topic === "esp32/sensor/data") {
            const data = JSON.parse(message.toString());
            console.log("📥 Sensor Data:", data);

            const emitData = { ...data, created_at: new Date().toISOString() };
            io.emit('sensorDataUpdate', emitData);

            const { temperature, humidity, light } = data;
            await pool.execute(
                "INSERT INTO Sensors (temperature, humidity, light) VALUES (?, ?, ?)",
                [temperature, humidity, light]
            );
        }
    } catch (err) {
        console.error("❌ Error handling MQTT message:", err);
    }
});

// ================== APP CONFIG & ROUTES ==================
app.set("mqttClient", mqttClient);
app.set("db", pool);

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/apis', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/sensors", sensorRoutes);
app.use("/api/devices", deviceRoutes);

app.post(
    '/api/devices/profile',
    upload.single('avatar'),
    updateProfile
);

app.get("/", (req, res) => {
    res.send("IoT Server with Express + MySQL + MQTT + Socket.IO is running 🚀. Check API Docs at /apis");
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🌍 Server running on http://localhost:${PORT}`);
    console.log(`📄 API Docs available at http://localhost:${PORT}/apis`);
});
