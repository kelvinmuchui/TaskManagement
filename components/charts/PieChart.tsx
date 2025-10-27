// components/charts/PieChart.tsx
'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Task {
  statusId: number;
}

interface PieChartProps {
  tasks: Task[];
}

const statusNames = ['To Do', 'Pending', 'Done', 'On Hold'];

export default function PieChartComponent({ tasks }: PieChartProps) {
  // Count tasks by status
  const statusCounts = [0, 0, 0, 0];
  
  tasks.forEach((task) => {
    if (task.statusId >= 1 && task.statusId <= 4) {
      statusCounts[task.statusId - 1]++;
    }
  });

  const data = {
    labels: statusNames,
    datasets: [
      {
        label: 'Tasks',
        data: statusCounts,
        backgroundColor: [
          'rgba(124, 58, 237, 0.8)',  // purple - To Do
          'rgba(245, 158, 11, 0.8)',  // amber - Pending
          'rgba(16, 185, 129, 0.8)',  // green - Done
          'rgba(37, 99, 235, 0.8)',   // blue - On Hold
        ],
        borderColor: [
          'rgba(124, 58, 237, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(37, 99, 235, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          color: '#1e293b',
        },
      },
      title: {
        display: true,
        text: 'Task Status Distribution',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1e293b',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const total = statusCounts.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data to display
      </div>
    );
  }

  return <Pie data={data} options={options} />;
}