export default function DataTable({ rows }) {
    return (
        <div className="bg-white rounded-xl shadow overflow-auto">
            <table className="min-w-full text-left">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-3">STT</th>
                    <th className="p-3">Nhiệt độ</th>
                    <th className="p-3">Ánh sáng</th>
                    <th className="p-3">Độ ẩm</th>
                    <th className="p-3">Thời gian</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, i) => (
                    <tr key={r._id} className="border-b">
                        <td className="p-3">{i+1}</td>
                        <td className="p-3">{r.temperature} °C</td>
                        <td className="p-3">{r.light}</td>
                        <td className="p-3">{r.humidity} %</td>
                        <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
