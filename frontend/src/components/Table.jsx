// src/components/Table.jsx

import React, { useState, useMemo } from 'react';
// import './Table.css'; // Dùng ActionsHistory.css để đồng bộ style

/**
 * Component Table chung có Phân trang và hỗ trợ Sắp xếp
 * @param {Array} headers - Mảng tiêu đề cột (sử dụng làm keys)
 * @param {Array} data - Dữ liệu bảng (ĐÃ LỌC & SẮP XẾP từ component cha)
 * @param {string} title - Tiêu đề của bảng
 * @param {function} onSortChange - Hàm xử lý sắp xếp từ component cha
 * @param {string} sortBy - Cột đang được sắp xếp
 * @param {string} sortOrder - Thứ tự sắp xếp ('asc' hoặc 'desc')
 */
const Table = ({ 
    headers = [], 
    data = [], 
    title = '', 
    initialPageSize = 10,
    onSortChange, 
    sortBy, 
    sortOrder 
}) => {
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    
    // Ánh xạ tên trường dữ liệu sang tiêu đề hiển thị
    const displayHeadersMap = {
        id: 'ID',
        temperature: 'Nhiệt độ (°C)',
        humidity: 'Độ ẩm (%)',
        light: 'Ánh sáng (Lux)',
        created_at: 'Thời gian',
        ID: 'ID',
        Device: 'Thiết bị',
        Status: 'Trạng thái',
        Time: 'Thời gian'
    };

    const memoizedData = useMemo(() => {
        return Array.isArray(data) ? data : [];
    }, [data]);

    // Logic tính toán phân trang
    const totalItems = memoizedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = memoizedData.slice(startIndex, startIndex + pageSize); 

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1);
    };
    
    const renderSortIcon = (header) => {
        if (sortBy !== header) return null;
        return sortOrder === 'asc' ? ' ▲' : ' ▼';
    };

    // Hàm lấy giá trị từ hàng, chấp nhận cả viết hoa và viết thường cho keys (VD: ID vs id)
    const getCellValue = (row, header) => {
        // 1. Tìm khóa chính xác (VD: 'ID', 'Time')
        if (row.hasOwnProperty(header)) {
            return row[header];
        }

        // 2. Nếu không tìm thấy, thử tìm khóa viết thường (chủ yếu cho 'id', 'status', v.v.)
        const lowerCaseHeader = header.toLowerCase();
        if (row.hasOwnProperty(lowerCaseHeader)) {
            return row[lowerCaseHeader];
        }
        
        return null; 
    };
    
    // Kiểm tra cột số (cần căn phải)
    const isNumericColumn = (header) => 
        ['id', 'ID', 'temperature', 'humidity', 'light'].includes(header);
    
    // Kiểm tra cột trạng thái (cần style đặc biệt)
    const isStatusColumn = (header) => header === 'Status';


    return (
        // Sử dụng table-wrapper để đồng bộ hóa style container
        <div className="table-wrapper"> 
            
            <table className="actions-table"> {/* SỬ DỤNG CLASS CHUNG */}
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th 
                                key={header} 
                                onClick={() => onSortChange && onSortChange(header)}
                                className={`sortable ${sortBy === header ? 'active' : ''} ${isNumericColumn(header) ? 'align-right-header' : ''}`}
                            >
                                {/* SỬ DỤNG ÁNH XẠ TIÊU ĐỀ */}
                                {displayHeadersMap[header] || header} 
                                {renderSortIcon(header)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentData.length > 0 ? (
                        currentData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {headers.map((header, colIndex) => {
                                    const cellValue = getCellValue(row, header);
                                    let cellClassName = isNumericColumn(header) ? 'align-right' : '';
                                    
                                    if (isStatusColumn(header)) {
                                        // Lấy giá trị Status (hoặc status) để tạo class
                                        const statusValue = String(getCellValue(row, 'Status') || '').toLowerCase();
                                        cellClassName += ` status-${statusValue}`;
                                    }

                                    return (
                                        <td 
                                            key={colIndex} 
                                            className={cellClassName.trim()}
                                        >
                                            {cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="no-data-message">
                                {totalItems === 0 ? "Không có dữ liệu để hiển thị." : "Không tìm thấy dữ liệu trên trang này."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* KHU VỰC PHÂN TRANG */}
            <div className="pagination-controls">
                <label className="page-size-label">
                    Kích thước:
                    <select value={pageSize} onChange={handlePageSizeChange} className="page-size-select">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </label>

                <span className="page-info">
                    Trang {currentPage} trên {totalPages}
                </span>
                
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-button">
                    &lt;
                </button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-button">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default Table;