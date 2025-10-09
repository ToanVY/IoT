// src/pages/Profile.jsx (Final Version)

import React, { useState, useRef } from 'react';
import './Profile.css';
// import { updateProfileAPI } from '../api'; // Giả định hàm API

const Profile = () => {
    const fileInputRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [userData, setUserData] = useState({
        fullName: 'Lê Đức Toàn',
        studentId: 'B22DCCN730',
        github: 'https://github.com/ToanVY/IoT.git',
        figma: 'https://www.figma.com/design/R03h45Jnuu58OsxUIhrxlv/IoT?node-id=0-1',
        email: 'letoan5204@gmail.com',
        api: 'http://localhost:5000/apis/', // Trường API đã được thêm
        report: 'https://1drv.ms/b/c/06f6a8e015d96e1b/EUp349L4M5BGlxVVKwpnv4cBTZN-3q6cpgqRJmbUz5lHRA?e=THfKV4',
        avatarUrl: '/assets/profile-avatar.png'
    });

    const [isEditing, setIsEditing] = useState(false);

    // --- LOGIC XỬ LÝ LƯU (SAVE) ---
    const handleEditToggle = async () => {
        if (isEditing) {
            try {
                const formData = new FormData();
                
                // 1. Thêm file ảnh (nếu có)
                if (avatarFile) {
                    formData.append('avatar', avatarFile);
                }

                // 2. Thêm dữ liệu text
                formData.append('fullName', userData.fullName);
                formData.append('studentId', userData.studentId);
                formData.append('github', userData.github);
                formData.append('figma', userData.figma);
                formData.append('report', userData.report);
                formData.append('email', userData.email);
                formData.append('api', userData.api);
                
                console.log('Đang gửi dữ liệu lên server:', formData);
                
                // 3. GỌI API LƯU DỮ LIỆU (Cần triển khai trong file api.js)
                // const result = await updateProfileAPI(formData); 
                
                setAvatarFile(null); 
                alert('Cập nhật hồ sơ thành công!');

            } catch (error) {
                console.error("Lỗi khi lưu dữ liệu:", error);
                alert('Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
                return; 
            }
        }
        
        // Chuyển đổi trạng thái chỉnh sửa
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setAvatarFile(file); 
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Cập nhật URL để xem trước
                setUserData(prevData => ({
                    ...prevData,
                    avatarUrl: reader.result 
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileInput = () => {
        if (isEditing) {
             fileInputRef.current.click();
        }
    };

    // Hàm render giá trị hoặc input
    const renderField = (name, type = 'text') => {
        if (isEditing) {
            return (
                <input
                    type={type}
                    name={name}
                    value={userData[name]}
                    onChange={handleChange}
                    readOnly={false}
                    className="editable"
                />
            );
        }
        
        // Chế độ Xem (Read-only)
        const value = userData[name];
        
        // Xử lý đặc biệt cho các trường là URL
        if (name === 'github' || name === 'figma' || name === 'api') {
            return (
                <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="profile-value profile-link"
                >
                    {value}
                </a>
            );
        }
        
        // Trường thông thường (Full Name, Student ID, Email)
        return (
            <input
                type={type}
                value={value}
                readOnly={true}
                // Dùng một span hoặc div thay cho input nếu không muốn styling input
                // return <div className="profile-value">{value}</div>;
            />
        );
    };


    return (
        <div className="profile-page">
            <div className="profile-card">
                
                <div className="profile-header">
                    
                    <div className="avatar-section">
                        <div className="avatar-placeholder" onClick={triggerFileInput}>
                            {/* Dùng URL xem trước nếu có file mới, nếu không dùng URL cũ */}
                            <img src={userData.avatarUrl} alt="Ảnh đại diện" className="profile-avatar"/>
                            
                            {/* INPUT FILE ẨN */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={!isEditing}
                            />
                        </div>
                        
                        {isEditing && (
                           <button className="btn-secondary" onClick={triggerFileInput}>Thay đổi</button>
                        )}
                    </div>

                    <div className="info-intro">
                        <h3>{userData.fullName}</h3>
                        <p>{userData.studentId}</p>
                    </div>

                    <button 
                        className="btn-primary" 
                        onClick={handleEditToggle}
                    >
                        {isEditing ? 'Lưu' : 'Sửa'}
                    </button>
                </div>

                {/* Phần Form chi tiết */}
                <div className="profile-details">
                    
                    {/* HỌ VÀ TÊN */}
                    <div className="detail-row">
                        <label>Họ và tên</label>
                        {renderField('fullName')}
                    </div>

                    {/* MÃ SV */}
                    <div className="detail-row">
                        <label>Mã SV</label>
                        {renderField('studentId')}
                    </div>

                    {/* GITHUB */}
                    <div className="detail-row">
                        <label>Github</label>
                        {renderField('github')}
                    </div>
                    
                    {/* FIGMA */}
                    <div className="detail-row">
                        <label>Figma</label>
                        {renderField('figma')}
                    </div>

                    {/* REPORT */}
                    <div className="detail-row">
                        <label>Báo cáo</label>
                        {renderField('report')}
                    </div>
                    
                    {/* ⬅️ TRƯỜNG API ĐÃ ĐƯỢC THÊM VÀO ĐÂY */}
                    <div className="detail-row">
                        <label>API</label>
                        {renderField('api')}
                    </div>

                    {/* EMAIL */}
                    <div className="detail-row">
                        <label>Email</label>
                        {renderField('email', 'email')}
                        {/* Biểu tượng Email chỉ nên hiện khi không chỉnh sửa */}
                        {!isEditing && (
                            <span className="email-icon">📧</span>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;