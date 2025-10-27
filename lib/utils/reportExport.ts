// lib/utils/reportExport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Task {
  _id: string;
  userId: string;
  date: string;
  category: string;
  subcategory: string;
  title: string;
  statusId: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  todo: number;
  onHold: number;
  totalMinutes: number;
}

const statusNames = ['To Do', 'Pending', 'Done', 'On Hold'];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export async function exportReportWithChartsToPDF(
  tasks: Task[],
  reportRange: string,
  baseDate: string,
  stats: Stats
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 40;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Task Manager Analytics Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 25;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Type: ${reportRange.charAt(0).toUpperCase() + reportRange.slice(1)}`, 40, yPos);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 40, yPos, {
    align: 'right',
  });

  yPos += 20;
  doc.text(`Base Date: ${baseDate}`, 40, yPos);

  // Summary Statistics
  yPos += 30;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 40, yPos);

  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const totalHours = Math.floor(stats.totalMinutes / 60);
  const remainingMinutes = stats.totalMinutes % 60;
  const completionRate =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  const summaryData = [
    ['Total Tasks:', stats.total.toString()],
    ['Completed:', `${stats.completed} (${completionRate}%)`],
    ['Pending:', stats.todo.toString()],
    ['To Do:', stats.todo.toString()],
    ['On Hold:', stats.onHold.toString()],
    ['Total Time:', `${totalHours}h ${remainingMinutes}m`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 150 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 30;

  // Category Breakdown
  if (yPos > 650) {
    doc.addPage();
    yPos = 40;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Breakdown', 40, yPos);

  yPos += 20;

  const categoryData: Record<string, number> = {};
  tasks.forEach((task) => {
    if (task.category) {
      categoryData[task.category] =
        (categoryData[task.category] || 0) + task.durationMinutes;
    }
  });

  const categoryRows = Object.entries(categoryData).map(([category, minutes]) => [
    category,
    formatDuration(minutes),
  ]);

  if (categoryRows.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Total Duration']],
      body: categoryRows,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 30;
  }

  // Task List
  if (yPos > 650) {
    doc.addPage();
    yPos = 40;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Task Details', 40, yPos);

  yPos += 20;

  const taskRows = tasks.map((task) => [
    task.date,
    task.category,
    task.title.substring(0, 30) + (task.title.length > 30 ? '...' : ''),
    statusNames[task.statusId - 1] || '',
    `${task.startTime}-${task.endTime}`,
    formatDuration(task.durationMinutes),
  ]);

  if (taskRows.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Category', 'Title', 'Status', 'Time', 'Duration']],
      body: taskRows,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 80 },
        2: { cellWidth: 120 },
        3: { cellWidth: 60 },
        4: { cellWidth: 80 },
        5: { cellWidth: 60 },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw as string;
          let fillColor;
          let textColor = [0, 0, 0];

          if (status === 'To Do') {
            fillColor = [124, 58, 237];
            textColor = [255, 255, 255];
          } else if (status === 'Pending') {
            fillColor = [245, 158, 11];
            textColor = [11, 11, 11];
          } else if (status === 'Done') {
            fillColor = [16, 185, 129];
            textColor = [255, 255, 255];
          } else if (status === 'On Hold') {
            fillColor = [37, 99, 235];
            textColor = [255, 255, 255];
          }

          if (fillColor) {
            data.cell.styles.fillColor = fillColor;
            data.cell.styles.textColor = textColor;
          }
        }
      },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  }

  // Save
  const filename = `Report_${reportRange}_${baseDate}.pdf`;
  doc.save(filename);
}