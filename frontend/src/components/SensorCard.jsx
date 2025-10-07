// src/components/SensorCard.jsx
import React from 'react';
// import './SensorCard.css'; // File CSS cần thiết để tạo kiểu thẻ

const SensorCard = ({ title, value, unit, icon, statusClass = '' }) => {
    return (
        <div className={`sensor-card ${statusClass}`}>
            <p className="card-title">IoT Sensors</p>
            <div className="card-content">
                <h4 className="value-title">{title}</h4>
                <div className="value-group">
                    <span className="value">{value}</span>
                    <span className="unit">{unit}</span>
                </div>
                {/* Icon có thể được đặt ở đây nếu muốn hiển thị riêng biệt */}
            </div>
        </div>
    );
};

export default SensorCard;