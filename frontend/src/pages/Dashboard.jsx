// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getSensorData, controlDeviceAPI } from '../api'; 
import SensorChart from '../components/SensorChart';
import SensorCard from '../components/SensorCard';
import DeviceCard from '../components/DeviceCard';
import './Dashboard.css'; 

const Dashboard = () => {
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

    const socket = io('http://localhost:5000'); 

    useEffect(() => {
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
            setChartData(prev => [...prev.slice(-29), data]);
        });

        // 🔄 Nghe trạng thái thiết bị từ backend
        socket.on("deviceStates", (states) => {
            console.log("🔄 Nhận trạng thái thiết bị:", states);
            setDeviceStatus(states);
        });

        return () => {
            socket.off('sensorDataUpdate');
            socket.off('deviceStates');
            socket.disconnect();
        };
    }, []); 

    const handleDeviceControl = async (device, status) => {
        const newStatus = status; 
        const oldStatus = status === 'on' ? 'off' : 'on';
        
        setDeviceStatus(prev => ({ ...prev, [device]: newStatus }));

        try {
            await controlDeviceAPI(device, newStatus);
            console.log(`Lệnh ${newStatus} cho ${device} đã gửi thành công.`);
        } catch (error) {
            console.error(`Gửi lệnh thất bại cho ${device}:`, error);
            setDeviceStatus(prev => ({ ...prev, [device]: oldStatus }));
            alert(`Lỗi: Không thể gửi lệnh điều khiển ${device}.`);
        }
    };

    return (
        <div className="dashboard-page">
            
            
            <div className="sensor-summary-cards center">
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
