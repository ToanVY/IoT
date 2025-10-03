// frontend/src/api.js (Phần cần thêm/sửa)

const API_BASE_URL = 'http://localhost:5000/api'; 

// Hàm này dùng cho Dashboard (biểu đồ) và DataSensor (bảng)
export const getSensorData = async (limit = 30) => {
    const response = await fetch(`${API_BASE_URL}/sensors?limit=${limit}`);
    if (!response.ok) throw new Error('Lỗi tải dữ liệu cảm biến');
    return response.json();
};

// Hàm này dùng cho ActionsHistory
export const getActionsHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/devices/actions`);
    if (!response.ok) throw new Error('Lỗi tải lịch sử hành động');
    return response.json();
};

// HÀM MỚI: Điều khiển thiết bị qua API REST POST
export const controlDeviceAPI = async (device, status) => {
    const response = await fetch(`${API_BASE_URL}/devices/${device}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Gửi "ON" hoặc "OFF"
        body: JSON.stringify({ status: status.toUpperCase() }), 
    });
    
    if (!response.ok) {
        throw new Error('Lỗi gửi lệnh điều khiển từ API Backend');
    }
    return response.json();
};