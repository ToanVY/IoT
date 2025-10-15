// backend/controllers/deviceController.js


// --- ĐIỀU KHIỂN THIẾT BỊ ---
export const controlDevice = async (req, res) => {
  try {
    const mqttClient = req.app.get("mqttClient");
    const io = req.app.get("io"); // ✅ lấy io từ app
    const device = req.params.device;
    const { status } = req.body;

    const topic = `esp32/control/${device}`;
    mqttClient.publish(topic, status.toUpperCase());

    io.emit("pendingDevice", { device, status });

    res.json({ ok: true, message: `Đã gửi lệnh ${status} tới ${device}, chờ phản hồi...` });
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

// --- CẬP NHẬT HỒ SƠ (giữ nguyên) ---
export const updateProfile = async (req, res) => {
    const db = req.app.get("db"); 
    const userId = 1; 

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
