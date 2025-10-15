import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorChart = ({ sensorData }) => {
  const labels = sensorData.map((d, i) => i + 1);

  const data = {
    labels,
    datasets: [
      {
        label: "Nhiệt độ (°C)",
        data: sensorData.map((d) => d.temperature),
        borderColor: "red",
        yAxisID: "yTemp",
        fill: false,
      },
      {
        label: "Độ ẩm (%)",
        data: sensorData.map((d) => d.humidity),
        borderColor: "blue",
        yAxisID: "yHumidity",
        fill: false,
      },
      {
        label: "Ánh sáng (lux)",
        data: sensorData.map((d) => d.light),
        borderColor: "orange",
        yAxisID: "yLight",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Biểu đồ cảm biến" },
    },
    scales: {
      yTemp: {
        type: "linear",
        position: "left",
        suggestedMin: 0,
        suggestedMax: 50,
      },
      yHumidity: {
        type: "linear",
        position: "right",
        suggestedMin: 0,
        suggestedMax: 100,
        grid: { drawOnChartArea: false },
      },
      yLight: {
        type: "linear",
        display: false,
        suggestedMin: 0,
        suggestedMax: 2000,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default SensorChart;
