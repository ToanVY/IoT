// src/pages/ActionsHistory.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { getActionsHistory } from '../api'; 
import Table from '../components/Table'; 
import './ActionsHistory.css'; 

const ActionsHistory = () => {
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all'); 
    const [sortBy, setSortBy] = useState('time'); 
    const [sortOrder, setSortOrder] = useState('desc'); 
    
    // Bộ lọc riêng
    const [deviceFilter, setDeviceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Headers cho component Table
    const actionHeaders = ['id', 'device', 'status', 'time'];

    // Tùy chọn tìm kiếm (chỉ giữ lại all, time, id)
    const searchOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'time', label: 'Thời gian' },
        { value: 'id', label: 'ID' },
    ];
    
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

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc'); 
        }
    };
    
    const displayData = useMemo(() => {
        let currentActions = actions.map(item => ({
            id: item.ID || item.id,
            device: (item.Device || item.device || '').toLowerCase(),
            status: (item.Status || item.status || '').toUpperCase(),
            time: item.Time || item.time,
        }));
        
        // 1. Lọc theo Tìm kiếm
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            
            currentActions = currentActions.filter(action => {
                const formattedTime = formatTime(action.time).toLowerCase(); 
                
                if (searchType === 'all') {
                    const searchString = `${action.id} ${action.device} ${action.status} ${formattedTime}`;
                    return searchString.includes(lowerSearch);
                } 
                if (searchType === 'time') {
                    return formattedTime.includes(lowerSearch);
                } 
                if (searchType === 'id') {
                    return String(action.id).toLowerCase().includes(lowerSearch);
                }
                return true;
            });
        }

        // 2. Lọc theo Device
        if (deviceFilter !== 'all') {
            currentActions = currentActions.filter(a => a.device === deviceFilter);
        }

        // 3. Lọc theo Status
        if (statusFilter !== 'all') {
            currentActions = currentActions.filter(a => a.status === statusFilter.toUpperCase());
        }

        // 4. Sắp xếp
        if (sortBy) {
            currentActions.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                if (sortBy === 'id') {
                    const idA = parseInt(aValue);
                    const idB = parseInt(bValue);
                    if (idA < idB) return sortOrder === 'asc' ? -1 : 1;
                    if (idA > idB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }
                
                if (sortBy === 'time') {
                    const aTime = new Date(aValue).getTime();
                    const bTime = new Date(bValue).getTime();
                    if (aTime < bTime) return sortOrder === 'asc' ? -1 : 1;
                    if (aTime > bTime) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }
                
                const valA = String(aValue ?? '').toLowerCase();
                const valB = String(bValue ?? '').toLowerCase();
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // 5. Định dạng dữ liệu cuối cùng
        return currentActions.map(item => ({
            ...item,
            time: formatTime(item.time),
        }));
    }, [actions, searchTerm, searchType, sortBy, sortOrder, deviceFilter, statusFilter]);


    if (isLoading) return <div className="actions-history-page">Đang tải lịch sử...</div>;
    if (error) return <div className="actions-history-page error">{error}</div>;

    const currentSearchLabel = searchOptions.find(o => o.value === searchType)?.label || 'Tất cả';

    return (
        <div className="actions-history-page">
            <h2>Lịch sử Hành động Điều khiển</h2>

            <div className="table-controls">
                <div className="search-group">
                    {/* Search type */}
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
                    
                    {/* Search input */}
                    <input 
                        type="text" 
                        placeholder={`Tìm kiếm trong ${currentSearchLabel}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button">Search</button>

                    {/* Device filter - THÊM TÙY CHỌN SYSTEM */}
                    <select 
                        className="filter-select"
                        value={deviceFilter}
                        onChange={(e) => setDeviceFilter(e.target.value)}
                    >
                        <option value="all">Tất cả thiết bị</option>
                        <option value="light">Light</option>
                        <option value="fan">Fan</option>
                        <option value="ac">AC</option>
                    </select>

                    {/* Status filter - THÊM TÙY CHỌN OFFLINE */}
                    <select 
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ON">ON</option>
                        <option value="OFF">OFF</option>
                    </select>
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