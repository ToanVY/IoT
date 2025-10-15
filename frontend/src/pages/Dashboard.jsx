// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
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
  const [pendingDevice, setPendingDevice] = useState(null);

  const timeoutRef = useRef(null);
  const socketRef = useRef(null);

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

    // ✅ tạo socket 1 lần
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('sensorDataUpdate', (data) => {
      setLatestData(data);
      setChartData(prev => [...prev.slice(-29), data]);
    });

    socketRef.current.on('deviceStates', (states) => {
      console.log("🔄 Nhận trạng thái thiết bị:", states);
      setDeviceStatus(states);
      setPendingDevice(null);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDeviceControl = async (device, status) => {
    setPendingDevice(device);

    try {
      await controlDeviceAPI(device, status);
      console.log(`✅ Gửi lệnh ${status} cho ${device}, chờ phản hồi...`);

      // Timeout 5s
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        alert(`⚠️ Thiết bị "${device}" không phản hồi.`);
        setPendingDevice(null);
      }, 5000);

    } catch (error) {
      console.error(`❌ Lỗi gửi lệnh cho ${device}:`, error);
      alert(`Không thể điều khiển ${device}.`);
      setPendingDevice(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sensor Cards */}
      <div className="sensor-summary-cards">
        <SensorCard title="Nhiệt độ" value={latestData.temperature} unit="°C" icon="🌡️" theme="red" />
        <SensorCard title="Độ ẩm" value={latestData.humidity} unit="%" icon="💧" theme="blue" />
        <SensorCard title="Ánh sáng" value={latestData.light} unit="Lux" icon="💡" theme="yellow" />
      </div>

      {/* Chart */}
      <div className="chart-wrapper card">
        <SensorChart sensorData={chartData} />
      </div>

      {/* Device Control */}
      <div className="device-control-area">
        <DeviceCard
          device="light"
          label="Light"
          status={deviceStatus.light}
          onToggle={handleDeviceControl}
          loading={pendingDevice === 'light'}
        />
        <DeviceCard
          device="fan"
          label="Fan"
          status={deviceStatus.fan}
          onToggle={handleDeviceControl}
          loading={pendingDevice === 'fan'}
        />
        <DeviceCard
          device="ac"
          label="Ac"
          status={deviceStatus.ac}
          onToggle={handleDeviceControl}
          loading={pendingDevice === 'ac'}
        />
      </div>
    </div>
  );
};

export default Dashboard;