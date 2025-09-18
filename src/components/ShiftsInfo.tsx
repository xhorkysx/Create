import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ShiftData {
  date: string;
  departments: {
    name: string;
    names: string[];
  }[];
}

export const ShiftsInfo: React.FC = () => {
  const [shiftData, setShiftData] = useState<ShiftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const loadShiftData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading shifts data from smeny.xlsx...');

      // Fetch Excel file with timestamp to force refresh
      const timestamp = new Date().getTime();
      const response = await fetch(`/smeny.xlsx?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON - get raw data to handle dates properly
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        raw: true,
        defval: ''
      }) as any[][];

      console.log('Raw Excel data:', jsonData);

      // Get headers from first row (row 0)
      const headers = jsonData[0] || [];
      console.log('Headers (departments):', headers);

      // Get selected date
      const targetDate = selectedDate;
      const targetDay = targetDate.getDate();
      const targetMonth = targetDate.getMonth() + 1; // JavaScript months are 0-based
      const targetYear = targetDate.getFullYear();

      console.log('Looking for date:', targetDay, targetMonth, targetYear);

      // Find row with today's date in column A
      let matchingRow: any[] | null = null;
      let matchingRowIndex = -1;
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const dateCell = row[0]; // Column A
        console.log(`Row ${i}, Column A (date):`, dateCell, typeof dateCell);

        if (!dateCell) continue;

        // Handle different date formats
        let isDateMatch = false;

        // Check if it's an Excel serial number
        if (typeof dateCell === 'number') {
          try {
            // Convert Excel serial number to JavaScript Date
            const excelDate = new Date((dateCell - 25569) * 86400 * 1000);
            console.log('Excel serial date converted:', excelDate);
            
            if (excelDate.getDate() === targetDay && 
                excelDate.getMonth() + 1 === targetMonth && 
                excelDate.getFullYear() === targetYear) {
              isDateMatch = true;
            }
          } catch (e) {
            console.log('Error converting Excel serial date:', e);
          }
        }
        // Check if it's a date string
        else if (typeof dateCell === 'string' && dateCell.trim()) {
          // Try different date formats
          const dateStr = dateCell.trim();
          console.log('Checking date string:', dateStr);
          
          // Try DD.MM.YYYY format
          if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]);
              const year = parseInt(parts[2]);
              
              console.log('Parsed DD.MM.YYYY:', day, month, year);
              
              if (day === targetDay && month === targetMonth && year === targetYear) {
                isDateMatch = true;
              }
            }
          }
        }

        if (isDateMatch) {
          matchingRow = row;
          matchingRowIndex = i;
          console.log('Found matching row for today:', row);
          break;
        }
      }

      if (matchingRow) {
        // First pass: collect all department data
        const departmentData: { [key: string]: string[] } = {};
        
        // Skip column A (date column) and process columns B onwards
        for (let i = 1; i < headers.length; i++) {
          const departmentName = headers[i];
          const cellValue = matchingRow[i];
          
          // Only process departments that have a name
          if (departmentName && departmentName.toString().trim() !== '') {
            const fullDeptName = departmentName.toString().trim();
            
            // Extract only the first word from department name for grouping
            const firstWord = fullDeptName.split(' ')[0];
            
            // Use the first word as the key for grouping, but keep full name for display
            const groupKey = firstWord;
            
            // Initialize department array if it doesn't exist
            if (!departmentData[groupKey]) {
              departmentData[groupKey] = [];
            }
            
            // If there's data in this cell, add it to the department
            if (cellValue && cellValue.toString().trim() !== '') {
              departmentData[groupKey].push(cellValue.toString().trim());
            }
            
            console.log(`Column ${i}: "${fullDeptName}" -> Group: "${groupKey}", Value: "${cellValue}"`);
          }
        }

        // Second pass: create departments array from collected data
        const departments: { name: string; names: string[] }[] = [];
        
        for (const [deptName, names] of Object.entries(departmentData)) {
          departments.push({
            name: deptName,
            names: names
          });
        }

        console.log('Collected department data:', departmentData);
        console.log('Final departments:', departments);

        setShiftData({
          date: targetDate.toLocaleDateString('cs-CZ'),
          departments: departments
        });
      } else {
        console.log('No matching row found for today');
        setShiftData({
          date: targetDate.toLocaleDateString('cs-CZ'),
          departments: [{
            name: 'Žádná data',
            names: ['Žádná data pro vybraný den']
          }]
        });
      }

    } catch (err) {
      console.error('Error loading shift data:', err);
      setError('Chyba při načítání dat o směnách');
      
      // Fallback data
      setShiftData({
        date: selectedDate.toLocaleDateString('cs-CZ'),
        departments: [{
          name: 'Chyba',
          names: ['Chyba při načítání dat']
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigace po dnech
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Detekce velikosti obrazovky
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    loadShiftData();
  }, [selectedDate]); // Načte data při změně vybraného data

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Načítání dat o směnách...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header - responsive */}
      <div className="mb-4">
        {!isMobile ? (
          /* Desktop header */
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Směny</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Předchozí den"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={goToNextDay}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Následující den"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
              >
                Dnes
              </button>
            </div>
          </div>
        ) : (
          /* Mobile header */
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Směny</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousDay}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Předchozí den"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={goToNextDay}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Následující den"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors whitespace-nowrap"
                >
                  Dnes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {shiftData && (
        <div>
          {shiftData.departments.length === 0 || 
           (shiftData.departments.length === 1 && shiftData.departments[0].name.includes('Žádná')) ? (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <Clock className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-gray-600">Žádné směny pro vybraný den</p>
            </div>
          ) : (
            <>
              {!isMobile ? (
                /* Desktop layout - grid */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {shiftData.departments.map((department, deptIndex) => (
                    <div key={deptIndex} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                        {department.name}
                      </h4>
                      {department.names.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Žádné jméno</p>
                      ) : (
                        <div className="space-y-2">
                          {department.names.map((name, nameIndex) => (
                            <div 
                              key={nameIndex}
                              className="bg-white border border-gray-200 rounded-md p-2 text-center shadow-sm"
                            >
                              <span className="text-sm font-medium text-gray-800">{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Mobile layout - vertical list */
                <div className="space-y-4">
                  {shiftData.departments.map((department, deptIndex) => (
                    <div key={deptIndex} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                        {department.name}
                      </h4>
                      {department.names.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Žádné jméno</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {department.names.map((name, nameIndex) => (
                            <div 
                              key={nameIndex}
                              className="bg-white border border-gray-200 rounded-md p-3 text-center shadow-sm"
                            >
                              <span className="text-sm font-medium text-gray-800">{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
