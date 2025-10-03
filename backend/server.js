// backend/server.js

import express from "express";
import dotenv from "dotenv";
import mqtt from "mqtt";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer"; // ⬅️ IMPORT MULTER
import path from "path";
import { fileURLToPath } from "url"; // Để xử lý __dirname trong module ES6

import pool from "./dbConfig.js";
import deviceRoutes from "./routes/devices.js";
import sensorRoutes from "./routes/sensors.js";
// ⬅️ CẦN IMPORT HÀM updateProfile TỪ DEVICE CONTROLLER
import { updateProfile } from "./controllers/deviceController.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ================== CẤU HÌNH __dirname TRONG ES MODULE ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ================== CẤU HÌNH MULTER CHO AVATAR ==================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu file vào thư mục 'uploads/avatars'
        cb(null, path.join(__dirname, 'uploads/avatars'));
    },
    filename: (req, file, cb) => {
        // Đặt tên file là studentId (từ req.body) + timestamp + ext
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
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`🌐 Frontend client connected: ${socket.id}`);
});

// ================== CẤU HÌNH EXPRESS & MIDDLEWARE ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware cần thiết cho form data


// ⬅️ MỞ THƯ MỤC UPLOADS CHO FRONTEND TRUY CẬP (RẤT QUAN TRỌNG)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ================== MQTT CLIENT (Giữ nguyên) ==================
const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const mqttClient = mqtt.connect(MQTT_URL, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");
    mqttClient.subscribe("esp32/sensor/data", (err) => {
        if (!err) console.log("📡 Subscribed to esp32/sensor/data");
    });
});

mqttClient.on("message", async (topic, message) => {
    try {
        if (topic === "esp32/sensor/data") {
            const data = JSON.parse(message.toString());
            console.log("📥 Sensor Data:", data);

            // 1. GỬI DỮ LIỆU ĐẾN FRONTEND qua Socket.IO
            const emitData = { ...data, created_at: new Date().toISOString() };
            io.emit('sensorDataUpdate', emitData);

            // 2. Lưu vào MySQL
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

// Routes (Thiết bị và Cảm biến)
app.use("/api/sensors", sensorRoutes);
app.use("/api/devices", deviceRoutes);

// ⬅️ ROUTE CẬP NHẬT PROFILE (Dùng Multer Middleware)
app.post(
    '/api/devices/profile',
    upload.single('avatar'), // Multer middleware: nhận file từ trường 'avatar'
    updateProfile // Controller xử lý cập nhật CSDL
);

app.get("/", (req, res) => {
    res.send("IoT Server with Express + MySQL + MQTT + Socket.IO is running 🚀");
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🌍 Server running on http://localhost:${PORT}`);
});