// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; 
// import './Sidebar.css'; // Nếu bạn có file CSS riêng

const Sidebar = () => {
    return (
        // Thêm class 'sidebar' ở đây
        <div className="sidebar"> 
            <div className="logo-section">
                <h1>IoT Sensors</h1>
            </div>
            
            <nav className="nav-links">
                {/* Sử dụng NavLink để làm nổi bật trang hiện tại */}
                <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span role="img" aria-label="Dashboard">🔥</span> Dashboard
                </NavLink>
                <NavLink to="/data-sensor" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span role="img" aria-label="Data">📊</span> Data Sensor
                </NavLink>
                <NavLink to="/actions-history" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span role="img" aria-label="History">🕒</span> Actions History
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span role="img" aria-label="Profile">👤</span> Profile
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;