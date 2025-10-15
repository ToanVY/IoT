import express from "express";
import { getSensors, saveSensorData } from "../controllers/sensorController.js";

const router = express.Router();

// Lấy danh sách dữ liệu cảm biến (vd: GET /api/sensors?limit=50)
router.get("/", getSensors);

// Lưu dữ liệu cảm biến từ ESP32 (vd: POST /api/sensors với body { temperature, humidity, light })
router.post("/", async (req, res) => {
    try {
        const saved = await saveSensorData(req.body);
        res.status(201).json({ message: "Sensor data saved", saved });
    } catch (err) {
        console.error("Error saving sensor data:", err);
        res.status(500).json({ error: "Failed to save sensor data" });
    }
});

export default router;