// src/components/DeviceCard.jsx

import React from 'react';
import './DeviceCard.css'; // Sẽ tạo file này ở bước 3

const DeviceCard = ({ device, label, status, onToggle }) => {
    
    // Logic xác định trạng thái mới và icon/màu
    const newStatus = status === 'on' ? 'off' : 'on';
    const isDeviceOn = status === 'on';
    
    let icon = '⚙️';
    let themeClass = 'default';

    switch (device) {
        case 'light':
            icon = '💡';
            themeClass = isDeviceOn ? 'on-light' : 'off-light';
            break;
        case 'fan':
            icon = '🌀';
            themeClass = isDeviceOn ? 'on-fan' : 'off-fan';
            break;
        case 'ac':
            icon = 'ac-unit';
            themeClass = isDeviceOn ? 'on-ac' : 'off-ac';
            break;
        default:
            break;
    }

    const handleToggle = () => {
        // Gọi hàm xử lý từ Dashboard.jsx để gửi lệnh đến backend
        onToggle(device, newStatus);
    };

    return (
        <div className={`device-card card ${themeClass}`}>
            <div className={`device-icon ${icon === 'ac-unit' ? 'ac-unit' : ''}`}>
                {icon === 'ac-unit' ? '' : icon}
            </div>
            <h4 className="device-label">{label}</h4>
            <p className={`device-status status-${status}`}>
                Trạng thái: <strong>{isDeviceOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}</strong>
            </p>
            
            {/* Nút Bật/Tắt */}
            <button 
                className={`toggle-button toggle-${newStatus}`}
                onClick={handleToggle}
            >
                {isDeviceOn ? 'TẮT' : 'BẬT'}
            </button>
        </div>
    );
};

export default DeviceCard;