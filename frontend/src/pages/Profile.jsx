// src/pages/Profile.jsx (Đã sửa logic lưu và gửi ảnh)

import React, { useEffect, useState, useMemo, useRef } from 'react';
import './Profile.css';
// import { updateProfileAPI, uploadAvatarAPI } from '../api'; // Giả định hàm API

const Profile = () => {
    const fileInputRef = useRef(null);
    
    // THÊM STATE MỚI ĐỂ LƯU TRỮ FILE THÔ (File Object)
    const [avatarFile, setAvatarFile] = useState(null);

    const [userData, setUserData] = useState({
        fullName: 'Lê Đức Toàn',
        studentId: 'B22DCCN730',
        github: 'https://github.com/ToanVY/IoT.git',
        figma: 'https://www.figma.com/design/R03h45Jnuu58OsxUIhrxlv/IoT?node-id=0-1',
        email: 'letoan5204@gmail.com',
        avatarUrl: '/assets/profile-avatar.png'
    });

    const [isEditing, setIsEditing] = useState(false);

    // --- LOGIC XỬ LÝ LƯU (SAVE) ---
    const handleEditToggle = async () => {
        // Nếu đang ở chế độ chỉnh sửa (và sắp chuyển sang chế độ xem)
        if (isEditing) {
            try {
                // 1. CHUẨN BỊ DỮ LIỆU GỬI ĐI
                const formData = new FormData();
                
                // Thêm dữ liệu ảnh (Chỉ gửi nếu có file mới)
                if (avatarFile) {
                    formData.append('avatar', avatarFile);
                }

                // Thêm các trường dữ liệu text (Nếu API của bạn dùng FormData)
                formData.append('fullName', userData.fullName);
                formData.append('studentId', userData.studentId);
                // ... (thêm các trường khác)
                
                console.log('Đang gửi dữ liệu lên server...');
                
                // 2. GỌI API LƯU DỮ LIỆU
                // Giả định hàm này gọi API backend (cần được triển khai)
                // const result = await updateProfileAPI(formData); 
                
                // Sau khi lưu thành công, cập nhật URL ảnh nếu backend trả về URL mới
                // Ví dụ: setUserData(prev => ({...prev, avatarUrl: result.newAvatarUrl}));

                // Reset file thô sau khi gửi
                setAvatarFile(null); 

                alert('Cập nhật hồ sơ thành công!');

            } catch (error) {
                console.error("Lỗi khi lưu dữ liệu:", error);
                alert('Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
                // Giữ nguyên isEditing nếu lưu thất bại
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
    
    // --- HÀM XỬ LÝ CHỌN ẢNH MỚI ---
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // LƯU TRỮ FILE THÔ ĐỂ GỬI LÊN SERVER SAU
            setAvatarFile(file); 
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Chỉ cập nhật URL để xem trước (client-side preview)
                setUserData(prevData => ({
                    ...prevData,
                    avatarUrl: reader.result 
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Hàm kích hoạt input file khi nhấn nút "Thay đổi"
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="profile-page">
            
            <div className="profile-card">
                
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="avatar-placeholder">
                            <img src={userData.avatarUrl} alt="Ảnh đại diện" className="profile-avatar"/>
                            
                            {/* INPUT FILE ẨN */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        
                        <button className="btn-secondary" onClick={triggerFileInput}>Thay đổi</button>
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

                {/* Phần Form chi tiết (Giữ nguyên) */}
                <div className="profile-details">
                    
                    {/* HỌ VÀ TÊN */}
                    <div className="detail-row">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={userData.fullName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={isEditing ? 'editable' : ''}
                        />
                    </div>

                    {/* MÃ SV */}
                    <div className="detail-row">
                        <label>Mã SV</label>
                        <input
                            type="text"
                            name="studentId"
                            value={userData.studentId}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={isEditing ? 'editable' : ''}
                        />
                    </div>

                    {/* GITHUB */}
                    <div className="detail-row">
                        <label>Github</label>
                        <input
                            type="text"
                            name="github"
                            value={userData.github}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={isEditing ? 'editable' : ''}
                        />
                    </div>
                    
                    {/* FIGMA */}
                    <div className="detail-row">
                        <label>Figma</label>
                        <input
                            type="text"
                            name="figma"
                            value={userData.figma}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={isEditing ? 'editable' : ''}
                        />
                    </div>
                    
                    {/* EMAIL */}
                    <div className="detail-row">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={isEditing ? 'editable' : ''}
                        />
                        <span className="email-icon">📧</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;