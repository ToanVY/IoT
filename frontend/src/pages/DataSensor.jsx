import React, { useEffect, useState, useMemo } from 'react';
import { getSensorData } from '../api'; // Hàm API lấy dữ liệu
import Table from '../components/Table';
import './ActionsHistory.css';

const DataSensor = () => {
    const [rawSensorData, setRawSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Danh sách tiêu đề cột
    const sensorHeaders = ['id', 'temperature', 'humidity', 'light', 'created_at'];

    // Các tùy chọn tìm kiếm
    const searchOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'created_at', label: 'Ngày/Thời gian' },
        { value: 'temperature', label: 'Nhiệt độ' },
        { value: 'humidity', label: 'Độ ẩm' },
        { value: 'light', label: 'Ánh sáng' },
        { value: 'id', label: 'ID' },
    ];

    // 🕒 Hàm định dạng thời gian "HH:MM:SS DD/MM/YYYY"
    const formatTime = (timeString) => {
        if (!timeString) return '--';
        const date = new Date(timeString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${hh}:${min}:${ss} ${dd}/${mm}/${yyyy}`;
    };

    // 🔄 Lấy dữ liệu cảm biến từ Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
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

    // ⚙️ Lọc và sắp xếp dữ liệu hiển thị
    const displayData = useMemo(() => {
        let currentData = Array.isArray(rawSensorData) ? [...rawSensorData] : [];

        // 1️⃣ Lọc dữ liệu
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase().trim();

            currentData = currentData.filter(item => {
                const rawTime = item.created_at;
                if (!rawTime) return false;

                const dateObj = new Date(rawTime);
                const formattedTime = formatTime(rawTime).toLowerCase();

                // Tạo các dạng ngày/giờ để tìm kiếm
                const dateVN = dateObj.toLocaleDateString('vi-VN'); // 03/10/2025
                const timeVN = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); // 00:23
                const isoFormat = dateObj.toISOString().replace('T', ' ').slice(0, 19); // 2025-10-03 00:23:01

                const combinedFormats = [
                    formattedTime,              // 03/10/2025 00:23:01
                    `${timeVN} ${dateVN}`,      // 00:23 03/10/2025
                    `${dateVN} ${timeVN}`,      // 03/10/2025 00:23
                    dateVN,                     // 03/10/2025
                    timeVN,                     // 00:23
                    isoFormat                   // 2025-10-03 00:23:01
                ].map(f => f.toLowerCase());

                if (searchType === 'all') {
                    const searchFields = sensorHeaders.map(key => String(item[key] ?? '').toLowerCase());
                    const fullSearchString = [...searchFields, ...combinedFormats].join(' ');
                    return fullSearchString.includes(lowerSearch);
                } 
                else if (searchType === 'created_at') {
                    return combinedFormats.some(f => f.includes(lowerSearch));
                } 
                else {
                    const value = item[searchType];
                    return String(value ?? '').toLowerCase().includes(lowerSearch);
                }
            });
        }

        // 2️⃣ Sắp xếp dữ liệu
        if (sortBy) {
            currentData.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                const numericColumns = ['id', 'temperature', 'humidity', 'light'];

                if (numericColumns.includes(sortBy)) {
                    const numA = parseFloat(aValue);
                    const numB = parseFloat(bValue);
                    if (numA < numB) return sortOrder === 'asc' ? -1 : 1;
                    if (numA > numB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                }

                if (sortBy === 'created_at') {
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

        // 3️⃣ Định dạng dữ liệu hiển thị
        const formattedData = currentData.map(item => ({
            ...item,
            created_at: formatTime(item.created_at)
        }));

        return formattedData;
    }, [rawSensorData, searchTerm, searchType, sortBy, sortOrder]);

    // 🔁 Thay đổi sắp xếp
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
                    {/* Dropdown chọn loại tìm kiếm */}
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

                    {/* Ô nhập từ khóa tìm kiếm */}
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
