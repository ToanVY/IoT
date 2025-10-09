// src/components/DeviceCard.jsx
import React from 'react';
import './DeviceCard.css';

const DeviceCard = ({ device, label, status, onToggle, loading }) => {
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
        if (!loading) {
            onToggle(device, newStatus);
        }
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
            
            {/* Nút Bật/Tắt hoặc Loading */}
            {loading ? (
                <button className="toggle-button btn-loading" disabled>
                    <span className="spinner"></span>
                </button>
            ) : (
                <button 
                    className={`toggle-button toggle-${newStatus}`}
                    onClick={handleToggle}
                >
                    {isDeviceOn ? 'TẮT' : 'BẬT'}
                </button>
            )}
        </div>
    );
};

export default DeviceCard;
