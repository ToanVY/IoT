// src/pages/DataSensor.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { getSensorData } from '../api'; // Giả định hàm API
import Table from '../components/Table';
import './ActionsHistory.css'; // SỬ DỤNG CSS ĐỒNG BỘ

const DataSensor = () => {
    const [rawSensorData, setRawSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    
    // Tên cột khớp với keys từ MySQL
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Tiêu đề cột và tùy chọn tìm kiếm
    const sensorHeaders = ['id', 'temperature', 'humidity', 'light', 'created_at'];

    // ĐÃ THÊM TÙY CHỌN TÌM KIẾM THEO ID
    const searchOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'created_at', label: 'Ngày/Thời gian' },
        { value: 'temperature', label: 'Nhiệt độ' },
        { value: 'humidity', label: 'Độ ẩm' },
        { value: 'light', label: 'Ánh sáng' },
        { value: 'id', label: 'ID' },
    ];
    
    // Hàm định dạng thời gian
    const formatTime = (timeString) => {
        if (!timeString) return '--';
        const date = new Date(timeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Tải 1000 bản ghi (hoặc số lượng bạn cần)
                const data = await getSensorData(1000); 
                setRawSensorData(data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu cảm biến:", error);
                setRawSensorData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LOGIC TÌM KIẾM VÀ SẮP XẾP ---
    const displayData = useMemo(() => {
        let currentData = Array.isArray(rawSensorData) ? [...rawSensorData] : []; 

        // 1. Lọc (Filter) - Giữ nguyên logic tìm kiếm đã tối ưu
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            
            currentData = currentData.filter(item => {
                const formattedTime = formatTime(item.created_at).toLowerCase();
                
                if (searchType === 'all') {
                    const searchFields = sensorHeaders.map(key => String(item[key] ?? '').toLowerCase());
                    const fullSearchString = searchFields.join(' ') + ' ' + formattedTime;
                    
                    return fullSearchString.includes(lowerSearch);
                    
                } else if (searchType === 'created_at') {
                    return formattedTime.includes(lowerSearch);
                    
                } else {
                    const value = item[searchType];
                    return String(value ?? '').toLowerCase().includes(lowerSearch);
                }
            });
        }

        // 2. Sắp xếp (Sort) - ĐÃ CẬP NHẬT LOGIC SẮP XẾP SỐ
        if (sortBy) {
            currentData.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                // Các cột cần sắp xếp dưới dạng số
                const numericColumns = ['id', 'temperature', 'humidity', 'light'];

                // --- Sắp xếp Số ---
                if (numericColumns.includes(sortBy)) {
                    const numA = parseFloat(aValue);
                    const numB = parseFloat(bValue);
                    
                    if (numA < numB) return sortOrder === 'asc' ? -1 : 1;
                    if (numA > numB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }

                // --- Sắp xếp Thời gian ---
                if (sortBy === 'created_at') {
                    const aTime = new Date(aValue).getTime();
                    const bTime = new Date(bValue).getTime();
                    if (aTime < bTime) return sortOrder === 'asc' ? -1 : 1;
                    if (aTime > bTime) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }
                
                // --- Sắp xếp Chuỗi (còn lại) ---
                const valA = String(aValue ?? '').toLowerCase();
                const valB = String(bValue ?? '').toLowerCase();

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        // 3. CHUẨN BỊ DỮ LIỆU ĐỂ HIỂN THỊ (Định dạng thời gian)
        const formattedData = currentData.map(item => ({
            ...item,
            created_at: formatTime(item.created_at) // Định dạng thời gian
        }));

        return formattedData; 
    }, [rawSensorData, searchTerm, searchType, sortBy, sortOrder]); 
    
    // ---------------------------------------------------------------
    
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc'); 
        }
    };

    if (loading) return <div className="loading-center">Đang tải dữ liệu cảm biến...</div>;

    const currentSearchLabel = searchOptions.find(o => o.value === searchType)?.label || 'Tất cả';

    return (
        <div className="actions-history-page">
            <h2>Bảng Dữ liệu Cảm biến</h2> 
            
            <div className="table-controls"> 
                <div className="search-group">
                    
                    {/* DROPDOWN CHỌN TYPE (LOẠI TÌM KIẾM) */}
                    <select 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)} 
                        className="filter-select" 
                    >
                        {searchOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* INPUT TÌM KIẾM */}
                    <input
                        type="text"
                        placeholder={`Tìm kiếm trong ${currentSearchLabel}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <button className="search-button">Search</button>
                </div>
            </div>

            <div className="table-container"> 
                <Table 
                    headers={sensorHeaders} 
                    data={displayData} 
                    title="Bảng Dữ liệu Cảm biến"
                    onSortChange={handleSortChange} 
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </div>
        </div>
    );
};

export default DataSensor;