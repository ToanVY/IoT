// src/App.jsx (Phiên bản đã sửa)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import Sidebar from './components/Sidebar'; 
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import ActionsHistory from './pages/ActionsHistory';
import Profile from './pages/Profile';
import './index.css'; 
// import Header from './components/Header'; // Giả định bạn sẽ tạo file này

const App = () => {
    return (
        <Router>
            {/* Thẻ cha bao bọc toàn bộ màn hình */}
            <div className="app-container"> 
                
                {/* Khu vực Sidebar (Cột bên trái) */}
                <Sidebar />
                
                {/* Khu vực chính: Chứa Header và Nội dung Cuộn */}
                <div className="main-content-wrapper">
                    
                    {/* Header (Ngang toàn bộ màn hình, bên phải Sidebar) 
                    <Header /> */}
                    
                    {/* Tạm thời dùng div cho Header nếu chưa có component */}
                    <div className="top-header">
                        {/* Bạn có thể thêm các control như Search, Type, Save vào đây */}
                        <div className="header-title">Dashboard Home</div>
                    </div>
                    
                    {/* Nội dung Pages (Khu vực cuộn được) */}
                    <div className="content-area"> 
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/data-sensor" element={<DataSensor />} />
                            <Route path="/actions-history" element={<ActionsHistory />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default App;