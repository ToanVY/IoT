// src/components/SensorChart.jsx

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SensorChart = ({ sensorData = [] }) => {
    
    // Sử dụng useMemo để tối ưu hiệu suất, chỉ tính toán lại khi sensorData thay đổi
    const chartData = useMemo(() => {
        const dataArray = Array.isArray(sensorData) ? sensorData : [];

        // 1. Chuẩn bị Labels (Thời gian)
        const labels = dataArray.map(item => {
            const date = new Date(item.created_at); // Giả định trường thời gian là 'created_at'
            // Format thời gian thành HH:MM:SS
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });

        // 2. Chuẩn bị 3 Datasets riêng biệt
        return {
            labels: labels,
            datasets: [
                {
                    label: 'Nhiệt độ (°C)',
                    data: dataArray.map(item => item.temperature), 
                    borderColor: 'rgb(255, 99, 132)', 
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'yTemp', // Trục Y cho Nhiệt độ
                    tension: 0.3, // Độ cong của đường
                },
                {
                    label: 'Độ ẩm (%)',
                    data: dataArray.map(item => item.humidity), 
                    borderColor: 'rgb(53, 162, 235)', 
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    yAxisID: 'yHumidity', // Trục Y cho Độ ẩm
                    tension: 0.3,
                },
                {
                    label: 'Ánh sáng (Lux)',
                    data: dataArray.map(item => item.light), 
                    borderColor: 'rgb(255, 206, 86)', 
                    backgroundColor: 'rgba(255, 206, 86, 0.5)',
                    yAxisID: 'yLight', // Trục Y cho Ánh sáng (có thể ẩn)
                    tension: 0.3,
                },
            ],
        };
    }, [sensorData]); // Tái tính toán khi sensorData thay đổi

    // Cấu hình Biểu đồ (Options)
    const options = {
        responsive: true,
        maintainAspectRatio: false, 
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: 'Biểu đồ Cảm biến Thời gian thực',
            },
            legend: {
                position: 'top',
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian',
                },
            },
            // Trục Y 1: Nhiệt độ (bên trái)
            yTemp: { 
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)',
                },
            },
            // Trục Y 2: Độ ẩm (bên phải)
            yHumidity: { 
                type: 'linear',
                display: true,
                position: 'right', 
                grid: {
                    drawOnChartArea: false, // Giúp biểu đồ đỡ rối mắt
                },
                title: {
                    display: true,
                    text: 'Độ ẩm (%)',
                },
                min: 0,
                max: 100, // Độ ẩm thường từ 0-100%
            },
            // Trục Y 3: Ánh sáng (thường không hiển thị trục để tránh rối)
            yLight: {
                type: 'linear',
                display: false, 
                position: 'right', 
                grid: {
                    drawOnChartArea: false,
                },
            }
        },
    };

    return (
        <div style={{ height: '400px', width: '100%' }}> 
            <Line options={options} data={chartData} />
        </div>
    );
};

export default SensorChart;