// sensorController.js (Phiên bản đã sửa)

// export const saveSensorData... (Phần này không cần sửa)
export const saveSensorData = async (data, app) => {
    try {
        const pool = app.get("db"); // lấy pool MySQL từ server.js

        const { temperature, humidity, light } = data;

        // Lưu ý: Đảm bảo tên cột 'Temperature', 'Humidity', 'Light' khớp với tên cột trong DB
        await pool.query(
            "INSERT INTO Sensors (Temperature, Humidity, Light) VALUES (?, ?, ?)",
            [temperature, humidity, light]
        );

        console.log("✅ Sensor data saved:", data);
    } catch (err) {
        console.error("❌ Lỗi saveSensorData:", err);
    }
};


// Lấy dữ liệu cảm biến từ MySQL
export const getSensors = async (req, res) => {
    try {
        // Lấy pool từ đối tượng request (chính xác hơn)
        const pool = req.app.get("db"); 
        
        // Đảm bảo limit là số nguyên, mặc định là 50
        const limit = parseInt(req.query.limit || "1000"); 

        // SỬA CHỮA: Sử dụng biến 'limit' (?) thay vì cố định 50.
        // CŨNG SỬA CHỮA: Sử dụng tên cột 'created_at' là snake_case (chữ thường) 
        // vì nó phổ biến hơn trong MySQL, nếu vẫn lỗi, hãy kiểm tra lại tên cột.
        const [rows] = await pool.query(
            "SELECT * FROM Sensors ORDER BY created_at DESC LIMIT ?", 
            [limit] // <--- TRUYỀN THAM SỐ LIMIT VÀO ĐÂY
        );

        res.json(rows);
    } catch (err) {
        console.error("❌ Lỗi getSensors:", err);
        // Trả về lỗi chi tiết hơn, nhưng không nên trả về err.message cho client
        // Hãy kiểm tra log server để xem lỗi thật sự.
        res.status(500).json({ error: "Lỗi Server nội bộ khi truy vấn dữ liệu cảm biến." });
    }
};