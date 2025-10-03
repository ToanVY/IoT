// backend/controllers/deviceController.js

import pool from '../dbConfig.js'; // Đảm bảo import pool đúng cách
import path from 'path';

// --- HÀM CŨ: ĐIỀU KHIỂN THIẾT BỊ ---
// Điều khiển thiết bị (light | fan | ac)
export const controlDevice = async (req, res) => {
    try {
        const mqttClient = req.app.get("mqttClient");
        const pool = req.app.get("db");      // lấy pool MySQL từ server.js

        const device = req.params.device; // ví dụ: light, fan, ac
        const { status } = req.body;      // "ON" hoặc "OFF"
        const topic = `esp32/control/${device}`;

        // Gửi lệnh MQTT tới ESP32
        mqttClient.publish(topic, status);

        // Lưu lịch sử vào MySQL
        // Giả định bảng là `Actions`
        await pool.query(
            "INSERT INTO Actions (Device, Status) VALUES (?, ?)",
            [device, status]
        );

        res.json({ ok: true, device, status });
    } catch (err) {
        console.error("❌ Lỗi controlDevice:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- HÀM CŨ: LỊCH SỬ HÀNH ĐỘNG ---
// Lấy danh sách lịch sử điều khiển
export const getActions = async (req, res) => {
    try {
        const pool = req.app.get("db");
        // Đảm bảo tên cột trong CSDL khớp: Device, Status, Time
        const [rows] = await pool.query(
            "SELECT ID, Device, Status, Time FROM Actions ORDER BY Time DESC LIMIT 500" // Tăng giới hạn lên 500
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Lỗi getActions:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- HÀM MỚI: CẬP NHẬT HỒ SƠ VÀ ẢNH ĐẠI DIỆN ---
/**
 * Cập nhật hồ sơ người dùng (bao gồm file ảnh đại diện)
 * Endpoint: POST /api/devices/profile
 * Yêu cầu: Middleware Multer (upload.single('avatar')) phải chạy trước hàm này
 */
export const updateProfile = async (req, res) => {
    const pool = req.app.get("db"); 
    const userId = 1; // ⚠️ Cần thay đổi: Sử dụng ID người dùng thực tế (ví dụ: từ token/session)
    
    // Lấy dữ liệu text từ req.body (được Multer xử lý)
    const { fullName, studentId, github, figma, email } = req.body;
    
    // Đường dẫn ảnh mới (nếu Multer đã lưu file)
    // Giả định Multer lưu vào thư mục 'uploads/avatars'
    const newAvatarPath = req.file ? `/avatars/${req.file.filename}` : null;
    
    try {
        let query = `
            UPDATE users 
            SET full_name = ?, student_id = ?, github_link = ?, figma_link = ?, email = ?
        `;
        let params = [fullName, studentId, github, figma, email];

        if (newAvatarPath) {
            // Nếu có ảnh mới, thêm trường avatar_url vào query và params
            query += ', avatar_url = ?';
            params.push(newAvatarPath); 
        }

        query += ' WHERE id = ?';
        params.push(userId);
        
        await pool.query(query, params);

        // Trả về URL ảnh mới để frontend cập nhật ngay lập tức
        res.status(200).json({ 
            message: 'Cập nhật hồ sơ thành công!',
            // Trả về URL hoàn chỉnh (ví dụ: http://localhost:5000/uploads/avatars/tenfile.jpg)
            newAvatarUrl: newAvatarPath ? `/uploads${newAvatarPath}` : undefined 
        });

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật hồ sơ:', error);
        // Trong trường hợp lỗi, cần xóa file vừa tải lên (nếu có)
        // [Cần thêm logic xóa file ở đây nếu quá trình update CSDL thất bại]
        res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ.' });
    }
};