// lib/utils/export.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Task {
  _id: string;
  userId: string;
  date: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  statusId: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

const statusNames = ["To Do", "Pending", "Done", "On Hold"];

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function exportTasksToPDF(
  tasks: Task[],
  filename: string,
  includeUser: boolean = false,
  dateRange: string = '',
  filters: {
    date?: string;
    category?: string;
    status?: string;
  } = {}
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Task Manager Report', 40, 40);

  // Report Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString();
  doc.text(`Generated: ${today}`, 40, 60);
  doc.text(`Date Range: ${dateRange || 'Custom'}`, 40, 75);
  
  if (filters.date) {
    doc.text(`Filter - Date: ${filters.date}`, 40, 90);
  }
  if (filters.category) {
    doc.text(`Filter - Category: ${filters.category}`, 200, 90);
  }
  if (filters.status) {
    doc.text(`Filter - Status: ${statusNames[parseInt(filters.status) - 1]}`, 400, 90);
  }

  // Summary Statistics
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.statusId === 3).length;
  const pending = tasks.filter(t => t.statusId === 2).length;
  const todo = tasks.filter(t => t.statusId === 1).length;
  const onHold = tasks.filter(t => t.statusId === 4).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const summaryY = filters.date || filters.category || filters.status ? 110 : 95;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary:', 40, summaryY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total: ${totalTasks}`, 40, summaryY + 15);
  doc.text(`Completed: ${completed}`, 120, summaryY + 15);
  doc.text(`Pending: ${pending}`, 200, summaryY + 15);
  doc.text(`To Do: ${todo}`, 280, summaryY + 15);
  doc.text(`On Hold: ${onHold}`, 360, summaryY + 15);
  doc.text(`Total Time: ${totalHours}h ${remainingMinutes}m`, 440, summaryY + 15);

  // Prepare table data
  const tableData = tasks.map(task => {
    const row = [
      task.date,
      task.category,
      task.subcategory,
      task.title,
      statusNames[task.statusId - 1] || '',
      `${task.startTime} - ${task.endTime}`,
      formatDuration(task.durationMinutes)
    ];

    if (includeUser) {
      row.unshift(task.userId);
    }

    return row;
  });

  // Table headers
  const headers = includeUser
    ? ['User', 'Date', 'Category', 'Subcategory', 'Title', 'Status', 'Time', 'Duration']
    : ['Date', 'Category', 'Subcategory', 'Title', 'Status', 'Time', 'Duration'];

  // Add table
  autoTable(doc, {
    startY: summaryY + 35,
    head: [headers],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 4
    },
    headStyles: {
      fillColor: [71, 85, 105], // slate-600
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === (includeUser ? 5 : 4)) {
        // Color-code status column
        const status = data.cell.raw as string;
        let fillColor;
        let textColor = [0, 0, 0];
        
        if (status === 'To Do') {
          fillColor = [124, 58, 237]; // purple
          textColor = [255, 255, 255];
        } else if (status === 'Pending') {
          fillColor = [245, 158, 11]; // amber
          textColor = [11, 11, 11];
        } else if (status === 'Done') {
          fillColor = [16, 185, 129]; // green
          textColor = [255, 255, 255];
        } else if (status === 'On Hold') {
          fillColor = [37, 99, 235]; // blue
          textColor = [255, 255, 255];
        }
        
        if (fillColor) {
          data.cell.styles.fillColor = fillColor;
          data.cell.styles.textColor = textColor;
        }
      }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(filename);
}

export function getDateRange(range: 'daily' | 'weekly' | 'monthly'): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  if (range === 'daily') {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  } else if (range === 'weekly') {
    const dayOfWeek = today.getDay();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else {
    // monthly
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}