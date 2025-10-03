// src/pages/ActionsHistory.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { getActionsHistory } from '../api'; // Giả định hàm API
import Table from '../components/Table'; // Component Bảng chung
import './ActionsHistory.css'; // File CSS đồng bộ

const ActionsHistory = () => {
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States cho điều khiển bảng
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all'); 
    
    // States cho sắp xếp (KHỚP VỚI KEYS TRONG DỮ LIỆU)
    const [sortBy, setSortBy] = useState('Time'); 
    const [sortOrder, setSortOrder] = useState('desc'); 
    
    // Headers cho component Table
    const actionHeaders = ['ID', 'Device', 'Status', 'Time'];

    // Tùy chọn tìm kiếm
    const searchOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'Time', label: 'Thời gian' },
        { value: 'Device', label: 'Thiết bị' },
        { value: 'Status', label: 'Trạng thái' },
        { value: 'ID', label: 'ID' },
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
        const fetchActions = async () => {
            try {
                const data = await getActionsHistory(); 
                setActions(data); 
            } catch (err) {
                console.error("Lỗi khi tải lịch sử hành động:", err);
                setError("Không thể tải dữ liệu lịch sử. Kiểm tra Server Backend và CSDL.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchActions();
    }, []);

    // HÀM XỬ LÝ SẮP XẾP
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc'); 
        }
    };
    
    // LOGIC LỌC/SẮP XẾP/CHUẨN BỊ DỮ LIỆU DÙNG useMemo
    const displayData = useMemo(() => {
        let currentActions = [...actions];
        
        // 1. Lọc theo Tìm kiếm và Loại (SearchType) (Giữ nguyên)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            
            currentActions = currentActions.filter(action => {
                const formattedTime = formatTime(action.Time).toLowerCase(); 
                
                if (searchType === 'all') {
                    const actionId = String(action.ID || action.id || '').toLowerCase(); 
                    const device = String(action.Device || '').toLowerCase();
                    const status = String(action.Status || '').toLowerCase();
                    const searchString = `${actionId} ${device} ${status} ${formattedTime}`;

                    return searchString.includes(lowerSearch);
                } 
                
                if (searchType === 'Time') {
                    return formattedTime.includes(lowerSearch);
                } 
                
                const value = action[searchType];
                return String(value ?? '').toLowerCase().includes(lowerSearch);
            });
        }

        // 2. Sắp xếp (ĐÃ SỬA: Thêm logic sắp xếp số cho ID)
        if (sortBy) {
            currentActions.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                // --- Sắp xếp Số (ID) ---
                if (sortBy === 'ID') {
                    const idA = parseInt(aValue || a.id); // Lấy ID (có thể là ID hoặc id)
                    const idB = parseInt(bValue || b.id);
                    if (idA < idB) return sortOrder === 'asc' ? -1 : 1;
                    if (idA > idB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }
                
                // --- Sắp xếp Thời gian ---
                if (sortBy === 'Time') {
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
        const formattedData = currentActions.map(item => ({
            ...item,
            Time: formatTime(item.Time) 
        }));
        
        return formattedData;
    }, [actions, searchTerm, searchType, sortBy, sortOrder]);


    if (isLoading) return <div className="actions-history-page">Đang tải lịch sử...</div>;
    if (error) return <div className="actions-history-page error">{error}</div>;

    const currentSearchLabel = searchOptions.find(o => o.value === searchType)?.label || 'Tất cả';

    return (
        <div className="actions-history-page">
            <h2>Lịch sử Hành động Điều khiển</h2>

            <div className="table-controls">
                <div className="search-group">
                    <select 
                        className="filter-select" 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        {searchOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    
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
                    headers={actionHeaders} 
                    data={displayData} 
                    title="Lịch sử Hành động Điều khiển"
                    onSortChange={handleSortChange} 
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </div>
        </div>
    );
};

export default ActionsHistory;