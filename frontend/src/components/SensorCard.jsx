export default function SensorCard({ title, value, unit, small=false }) {
    return (
        <div className={`sensor-card ${small ? "w-40" : "w-full"}`}>
            <div className="text-xs text-gray-500">{title}</div>
            <div className="mt-2 text-2xl font-semibold">{value} <span className="text-base">{unit}</span></div>
        </div>
    );
}
