// frontend/src/pages/Dashboard.jsx (Phần đã sửa)

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// Sửa import để lấy hàm điều khiển mới
import { getSensorData, controlDeviceAPI } from '../api'; 
import SensorChart from '../components/SensorChart';
import SensorCard from '../components/SensorCard';
import DeviceCard from '../components/DeviceCard';
import './Dashboard.css'; 

const Dashboard = () => {
    // ... các state khác (latestData, chartData)

    const [latestData, setLatestData] = useState({ 
        temperature: '--', 
        humidity: '--', 
        light: '--' 
    });
    const [chartData, setChartData] = useState([]); 
    
    const [deviceStatus, setDeviceStatus] = useState({
        light: 'off',
        fan: 'off',
        ac: 'off'
    });

    // Khởi tạo Socket.IO (Chỉ dùng để nhận dữ liệu cảm biến)
    const socket = io('http://localhost:5000'); 

    useEffect(() => {
        // ... (logic fetchInitialData và socket.on('sensorDataUpdate') giữ nguyên)
        const fetchInitialData = async () => {
            try {
                const data = await getSensorData(30); 
                setChartData(data.reverse()); 
                if (data.length > 0) {
                    setLatestData(data[data.length - 1]);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu ban đầu:", error);
            }
        };

        fetchInitialData();

        socket.on('sensorDataUpdate', (data) => {
            setLatestData(data);
            setChartData(prevChartData => {
                const newData = [...prevChartData, data];
                return newData.slice(-30); 
            });
        });

        return () => {
            socket.off('sensorDataUpdate');
            socket.disconnect();
        };
    }, []); 

    // HÀM MỚI: Xử lý điều khiển thiết bị bằng API REST
    const handleDeviceControl = async (device, status) => {
        const newStatus = status; // 'on' hoặc 'off'
        const oldStatus = status === 'on' ? 'off' : 'on';
        
        // 1. Cập nhật giao diện ngay lập tức (UI Optimistic Update)
        setDeviceStatus(prev => ({ ...prev, [device]: newStatus }));

        try {
            // 2. Gửi lệnh tới Backend qua API REST
            await controlDeviceAPI(device, newStatus);
            console.log(`Lệnh ${newStatus} cho ${device} đã gửi thành công qua REST.`);
            
        } catch (error) {
            console.error(`Gửi lệnh điều khiển thất bại cho ${device}:`, error);
            // 3. Nếu lỗi, hoàn tác lại trạng thái (Rollback)
            setDeviceStatus(prev => ({ ...prev, [device]: oldStatus }));
            alert(`Lỗi: Không thể gửi lệnh điều khiển ${device}. Vui lòng kiểm tra Server.`);
        }
    };

    return (
        // ... (Phần return JSX giữ nguyên)
        <div className="dashboard-page">
            <h2>Dashboard Home</h2>
            
            <div className="sensor-summary-cards">
                <SensorCard title="Nhiệt độ" value={latestData.temperature} unit="°C" icon="🌡️" theme="red" />
                <SensorCard title="Độ ẩm" value={latestData.humidity} unit="%" icon="💧" theme="blue" />
                <SensorCard title="Ánh sáng" value={latestData.light} unit="Lux" icon="💡" theme="yellow" />
            </div>
            
            <div className="chart-area card">
                <SensorChart sensorData={chartData} /> 
            </div>

            <div className="device-control-area">
                <DeviceCard device="light" label="Đèn Chiếu Sáng" status={deviceStatus.light} onToggle={handleDeviceControl} />
                <DeviceCard device="fan" label="Quạt Thông Gió" status={deviceStatus.fan} onToggle={handleDeviceControl} />
                <DeviceCard device="ac" label="Điều Hòa" status={deviceStatus.ac} onToggle={handleDeviceControl} />
            </div>
        </div>
    );
};

export default Dashboard;