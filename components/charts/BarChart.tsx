// components/charts/BarChart.tsx
'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Task {
  category: string;
  durationMinutes: number;
}

interface BarChartProps {
  tasks: Task[];
}

export default function BarChartComponent({ tasks }: BarChartProps) {
  // Aggregate duration by category
  const categoryData: Record<string, number> = {};
  
  tasks.forEach((task) => {
    if (task.category) {
      categoryData[task.category] = (categoryData[task.category] || 0) + task.durationMinutes;
    }
  });

  const categories = Object.keys(categoryData);
  const durations = Object.values(categoryData);

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Duration (minutes)',
        data: durations,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue
          'rgba(16, 185, 129, 0.8)',   // green
          'rgba(245, 158, 11, 0.8)',   // amber
          'rgba(239, 68, 68, 0.8)',    // red
          'rgba(168, 85, 247, 0.8)',   // purple
          'rgba(236, 72, 153, 0.8)',   // pink
          'rgba(14, 165, 233, 0.8)',   // sky
          'rgba(132, 204, 22, 0.8)',   // lime
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(132, 204, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Time Spent by Category',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1e293b',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const minutes = context.parsed.y;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            if (hours > 0) {
              return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
            }
            return `${mins}m`;
          },
        },
        title: {
          display: true,
          text: 'Duration',
          font: {
            weight: 'bold' as const,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Category',
          font: {
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data to display
      </div>
    );
  }

  return <Bar data={data} options={options} />;
}