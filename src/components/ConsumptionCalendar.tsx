import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ConsumptionEntry {
  id: string;
  date: string;
  fuelConsumption?: number;
  kilometers: number;
  averageConsumption: number;
  notes?: string;
}

interface ConsumptionCalendarProps {
  consumptionEntries: ConsumptionEntry[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddConsumption: (date: string) => void;
  onEditConsumption: (entry: ConsumptionEntry) => void;
  onDeleteConsumption: (id: string) => void;
  onMonthChange?: (month: Date) => void;
}

export function ConsumptionCalendar({
  consumptionEntries,
  selectedDate,
  onDateSelect,
  onAddConsumption,
  onEditConsumption,
  onDeleteConsumption,
  onMonthChange
}: ConsumptionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  // Notify parent about month changes
  useEffect(() => {
    onMonthChange?.(currentMonth);
  }, [currentMonth, onMonthChange]);

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const consumptionEntry = consumptionEntries.find(entry => entry.date === dateString);
      
      days.push({
        day,
        date,
        dateString,
        consumptionEntry
      });
    }
    
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Kalendář směn a spotřeby</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[150px] text-center">
              {formatMonthYear(currentMonth)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>


        <div className="space-y-1">
          {days.filter(dayInfo => dayInfo).map((dayInfo) => {
            const { day, date, dateString, consumptionEntry } = dayInfo;
            
            // Get weekday abbreviation
            const weekdays = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
            const weekday = weekdays[date.getDay()];

            return (
              <div
                key={dateString}
                className={`
                  p-2 border rounded cursor-pointer transition-colors
                  ${isSelected(date) ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}
                  ${isToday(date) ? 'ring-2 ring-blue-400' : ''}
                `}
                onClick={() => onDateSelect(date)}
              >
                {/* Top row with date, shift badge, consumption data and buttons */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className={`text-base font-medium ${isToday(date) ? 'font-bold' : ''}`}>
                        {day}
                      </span>
                      <span className="text-xs text-gray-500">
                        {weekday}
                      </span>
                    </div>
                    
                    {consumptionEntry && (
                      <>
                        <Badge 
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          Směna
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {consumptionEntry.averageConsumption} l/100km • {consumptionEntry.kilometers} km
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {consumptionEntry ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditConsumption(consumptionEntry);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Upravit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-red-500 border-red-300 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConsumption(consumptionEntry.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Smazat
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddConsumption(dateString);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Přidat
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Bottom row with notes */}
                {consumptionEntry && consumptionEntry.notes && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 italic break-words">
                      {consumptionEntry.notes}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Vybraný den</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Směna s daty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Směna bez dat</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
