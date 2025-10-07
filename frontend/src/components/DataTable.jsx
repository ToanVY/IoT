// src/components/DataTable.jsx
import React from 'react';
import Table from './Table';

// Định nghĩa cấu trúc cột cho dữ liệu cảm biến (phù hợp với bảng Sensors trong DB)
const sensorColumns = [
    { header: 'STT', accessor: 'id' }, 
    { header: 'Nhiệt độ (°C)', accessor: 'temperature' },
    { header: 'Độ ẩm (%)', accessor: 'humidity' },
    { header: 'Ánh sáng (lux)', accessor: 'light' },
    { header: 'Thời Gian', accessor: 'created_at' }, // Giả định tên cột trong DB
];

const DataTable = ({ data }) => {
    return (
        <Table 
            data={data} 
            columns={sensorColumns} 
            itemsPerPage={10} // Khớp với mockup
        />
    );
};

export default DataTable;