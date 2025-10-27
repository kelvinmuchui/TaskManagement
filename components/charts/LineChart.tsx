// components/charts/LineChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Task {
  date: string;
  statusId: number;
}

interface LineChartProps {
  tasks: Task[];
  dateRange: 'daily' | 'weekly' | 'monthly';
}

export default function LineChartComponent({ tasks, dateRange }: LineChartProps) {
  // Group tasks by date and count completed
  const dateData: Record<string, { total: number; completed: number }> = {};

  tasks.forEach((task) => {
    if (!dateData[task.date]) {
      dateData[task.date] = { total: 0, completed: 0 };
    }
    dateData[task.date].total++;
    if (task.statusId === 3) {
      dateData[task.date].completed++;
    }
  });

  // Sort dates and prepare chart data
  const sortedDates = Object.keys(dateData).sort();
  const completedCounts = sortedDates.map((date) => dateData[date].completed);
  const totalCounts = sortedDates.map((date) => dateData[date].total);

  const data = {
    labels: sortedDates.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Completed Tasks',
        data: completedCounts,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      },
      {
        label: 'Total Tasks',
        data: totalCounts,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
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
        text: 'Task Completion Trend',
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
          afterLabel: function (context: any) {
            if (context.datasetIndex === 0) {
              const total = totalCounts[context.dataIndex];
              const completed = completedCounts[context.dataIndex];
              const percentage =
                total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
              return `Completion Rate: ${percentage}%`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Tasks',
          font: {
            weight: 'bold' as const,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  if (sortedDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data to display
      </div>
    );
  }

  return <Line data={data} options={options} />;
}