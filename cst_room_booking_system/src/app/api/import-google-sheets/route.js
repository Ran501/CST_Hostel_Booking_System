// src/app/api/import-google-sheets/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { sheetUrl, sheetName } = await request.json();
    
    // Extract Google Sheet ID from URL
    const sheetId = extractSheetId(sheetUrl);
    
    if (!sheetId) {
      return NextResponse.json({ error: 'Invalid Google Sheet URL' }, { status: 400 });
    }
    
    // Fetch data from Google Sheets as CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName || 'Sheet1'}`;
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    
    // Parse CSV to JSON
    const students = parseCSVToStudents(csvData);
    
    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error importing from Google Sheets:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}

function extractSheetId(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function parseCSVToStudents(csvData) {
  const lines = csvData.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  
  const students = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const student = {
      name: values[headers.indexOf('name')] || '',
      studentId: values[headers.indexOf('student id')] || values[headers.indexOf('studentid')] || '',
      email: values[headers.indexOf('email')] || '',
      department: values[headers.indexOf('department')] || '',
      year: parseInt(values[headers.indexOf('year')] || 1),
      phone: values[headers.indexOf('phone')] || '',
      gender: values[headers.indexOf('gender')] || 'Male'
    };
    
    // Only add if name and studentId exist
    if (student.name && student.studentId) {
      students.push(student);
    }
  }
  return students;
}

function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentValue.replace(/^"|"$/g, '').trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  result.push(currentValue.replace(/^"|"$/g, '').trim());
  return result;
}