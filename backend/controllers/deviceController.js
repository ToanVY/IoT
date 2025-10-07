// backend/controllers/deviceController.js

import { io, deviceStates } from "../server.js"; // ⚠️ import từ server.js
import pool from '../dbConfig.js';

// --- ĐIỀU KHIỂN THIẾT BỊ ---
export const controlDevice = async (req, res) => {
    try {
        const mqttClient = req.app.get("mqttClient");
        const db = req.app.get("db");      

        const device = req.params.device; // light | fan | ac
        const { status } = req.body;      // "on" hoặc "off" (chữ thường theo FE)

        const topic = `esp32/control/${device}`;

        // 1. Gửi lệnh MQTT tới ESP32
        mqttClient.publish(topic, status.toUpperCase()); // ESP32 thường dùng ON/OFF

        // 2. Cập nhật trạng thái thiết bị trong biến toàn cục
        deviceStates[device] = status;

        // 3. Phát lại cho tất cả frontend
        io.emit("deviceStates", deviceStates);

        // 4. Lưu lịch sử vào MySQL
        await db.query(
            "INSERT INTO Actions (Device, Status) VALUES (?, ?)",
            [device, status]
        );

        res.json({ ok: true, device, status });
    } catch (err) {
        console.error("❌ Lỗi controlDevice:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- LỊCH SỬ HÀNH ĐỘNG ---
export const getActions = async (req, res) => {
    try {
        const db = req.app.get("db");
        const [rows] = await db.query(
            "SELECT ID, Device, Status, Time FROM Actions ORDER BY Time DESC LIMIT 500"
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Lỗi getActions:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- CẬP NHẬT HỒ SƠ ---
export const updateProfile = async (req, res) => {
    const db = req.app.get("db"); 
    const userId = 1; // ⚠️ Tạm fix cứng

    const { fullName, studentId, github, figma, email } = req.body;
    const newAvatarPath = req.file ? `/avatars/${req.file.filename}` : null;
    
    try {
        let query = `
            UPDATE users 
            SET full_name = ?, student_id = ?, github_link = ?, figma_link = ?, email = ?
        `;
        let params = [fullName, studentId, github, figma, email];

        if (newAvatarPath) {
            query += ', avatar_url = ?';
            params.push(newAvatarPath); 
        }

        query += ' WHERE id = ?';
        params.push(userId);
        
        await db.query(query, params);

        res.status(200).json({ 
            message: 'Cập nhật hồ sơ thành công!',
            newAvatarUrl: newAvatarPath ? `/uploads${newAvatarPath}` : undefined 
        });

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật hồ sơ:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ.' });
    }
};
