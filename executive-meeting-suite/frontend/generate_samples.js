const XLSX = require('xlsx');
const path = require('path');

const outputDir = './samples';

// Sample meeting data
const meeting = {
  title: 'DVAGO Ops Review Meeting',
  date: '8/28/2026',
  location: 'G&T Tower'
};

const actionItems = [
  {
    id: 1,
    title: 'Review operational efficiency metrics',
    description: 'Analyze Q3 performance data and identify improvement areas',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    owner: 'Adeel Siddiqui',
    dueDate: '9/5/2026',
    daysRemaining: 8
  },
  {
    id: 2,
    title: 'Prepare budget presentation for stakeholders',
    description: 'Compile financial reports and create presentation slides',
    priority: 'MEDIUM',
    status: 'OPEN',
    owner: 'Sarah Johnson',
    dueDate: '9/10/2026',
    daysRemaining: 13
  },
  {
    id: 3,
    title: 'Update team on new compliance requirements',
    description: 'Distribute training materials and schedule workshops',
    priority: 'HIGH',
    status: 'OPEN',
    owner: 'Michael Chen',
    dueDate: '9/1/2026',
    daysRemaining: 4
  }
];

// FORMAT 1: Simple Clean Table
function createFormat1() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['EXECUTIVE MEETING MINUTES'],
    [],
    ['Meeting Title:', meeting.title, 'Date:', meeting.date],
    ['Location:', meeting.location],
    [],
    ['ACTION ITEMS', 'Total:', actionItems.length],
    [],
    ['#', 'Action Item', 'Priority', 'Status', 'Owner', 'Due Date', 'Days Remaining']
  ];

  actionItems.forEach((item, idx) => {
    data.push([
      idx + 1,
      item.title,
      item.priority,
      item.status,
      item.owner,
      item.dueDate,
      item.daysRemaining
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 4 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Minutes');
  XLSX.writeFile(wb, path.join(outputDir, 'Format_1_Simple_Clean.xlsx'));
  console.log('Format 1 created');
}

// FORMAT 2: Detailed with Description Column
function createFormat2() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['EXECUTIVE MEETING MINUTES - ACTION ITEMS'],
    [],
    ['Meeting Title:', meeting.title],
    ['Date of Meeting:', meeting.date],
    ['Location:', meeting.location],
    ['Generated:', new Date().toLocaleDateString()],
    [],
    ['SUMMARY', 'Status Breakdown:'],
    ['Total Items:', actionItems.length, 'Open:', actionItems.filter(i => i.status === 'OPEN').length],
    ['In Progress:', actionItems.filter(i => i.status === 'IN_PROGRESS').length, 'Completed:', 0],
    [],
    ['#', 'Action Item', 'Description', 'Priority', 'Status', 'Owner', 'Due Date', 'Days Remaining']
  ];

  actionItems.forEach((item, idx) => {
    data.push([
      idx + 1,
      item.title,
      item.description,
      item.priority,
      item.status,
      item.owner,
      item.dueDate,
      item.daysRemaining
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 4 },
    { wch: 25 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Minutes');
  XLSX.writeFile(wb, path.join(outputDir, 'Format_2_With_Description.xlsx'));
  console.log('Format 2 created');
}

// FORMAT 3: Executive Style with Detailed Blocks
function createFormat3() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['EXECUTIVE MEETING MINUTES'],
    [],
    ['MEETING DETAILS'],
    ['Meeting:', meeting.title],
    ['Date:', meeting.date, 'Location:', meeting.location],
    [],
    ['ACTION ITEMS REPORT'],
    ['Total Items:', actionItems.length],
    [],
  ];

  // Add each item as a detailed block
  actionItems.forEach((item, idx) => {
    data.push([`${idx + 1}. ${item.title}`]);
    data.push(['Description:', item.description]);
    data.push(['Owner:', item.owner, 'Priority:', item.priority]);
    data.push(['Status:', item.status, 'Due Date:', item.dueDate, 'Days Remaining:', item.daysRemaining]);
    data.push([]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Minutes');
  XLSX.writeFile(wb, path.join(outputDir, 'Format_3_Detailed_Blocks.xlsx'));
  console.log('Format 3 created');
}

// Create samples directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

createFormat1();
createFormat2();
createFormat3();
console.log('All samples created in:', outputDir);
