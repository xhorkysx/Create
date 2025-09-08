import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TimeEntryList } from './TimeEntryList';
import { TimeSummary } from './TimeSummary';
import { Badge } from './ui/badge';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface TimeTrackingTabsProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TimeEntry) => void;
  realSalaries?: { [key: string]: number };
  onSetRealSalary?: (monthKey: string, amount: number) => void;
  onAddVacationHours?: (monthKey: string, hours: number) => void;
}

export function TimeTrackingTabs({ entries, onDeleteEntry, onEditEntry, realSalaries, onSetRealSalary, onAddVacationHours }: TimeTrackingTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Group entries by year and month
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: TimeEntry[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const yearKey = `year-${year}`;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      // Group by year
      if (!groups[yearKey]) {
        groups[yearKey] = [];
      }
      groups[yearKey].push(entry);
      
      // Group by month
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
    });
    
    return groups;
  }, [entries]);

  // Get available years and months
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    entries.forEach(entry => {
      const date = new Date(entry.date);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [entries]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      months.add(`${year}-${month.toString().padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [entries]);

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1);
    return date.toLocaleDateString('cs-CZ', { 
      month: 'long'
    });
  };

  const getEntryCount = (key: string) => {
    return groupedEntries[key]?.length || 0;
  };

  const getTotalRealSalaryForYear = (year: number) => {
    if (!realSalaries) return undefined;
    
    const yearMonths = availableMonths.filter(monthKey => 
      monthKey.startsWith(year.toString())
    );
    
    const total = yearMonths.reduce((sum, monthKey) => {
      return sum + (realSalaries[monthKey] || 0);
    }, 0);
    
    return total > 0 ? total : undefined;
  };

  // Get current month entries for overview
  const currentDate = new Date();
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth().toString().padStart(2, '0')}`;
  const currentMonthEntries = groupedEntries[currentMonthKey] || [];
  const currentMonthName = getMonthName(currentMonthKey);

  // Get months for a specific year
  const getMonthsForYear = (year: number) => {
    return availableMonths.filter(monthKey => monthKey.startsWith(year.toString()));
  };

  const handleYearClick = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  const tabs = [
    { value: 'overview', label: `Přehled - ${currentMonthName}`, entries: currentMonthEntries },
    ...availableYears.map(year => ({
      value: `year-${year}`,
      label: year.toString(),
      entries: groupedEntries[`year-${year}`] || [],
      isYear: true,
      year: year
    }))
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:flex lg:w-auto lg:h-auto">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-3">
              {tab.label}
              {tab.entries.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.entries.length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            <TimeSummary 
              entries={tab.entries} 
              period={tab.value === 'overview' ? undefined : tab.label}
              realSalary={tab.isYear ? getTotalRealSalaryForYear(tab.year) : undefined}
              onSetRealSalary={undefined}
              onAddVacationHours={undefined}
            />
            
            {/* Show year content with expandable months */}
            {tab.isYear ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getMonthsForYear(tab.year).map(monthKey => (
                    <button
                      key={monthKey}
                      onClick={() => setActiveTab(monthKey)}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        activeTab === monthKey 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      {getMonthName(monthKey)}
                      <Badge variant="secondary" className="ml-3 text-xs">
                        {getEntryCount(monthKey)}
                      </Badge>
                    </button>
                  ))}
                </div>
                
                <TimeEntryList
                  entries={tab.entries}
                  onDeleteEntry={onDeleteEntry}
                  onEditEntry={onEditEntry}
                  title={`Záznamy - ${tab.label}`}
                />
              </div>
            ) : (
              <TimeEntryList
                entries={tab.entries}
                onDeleteEntry={onDeleteEntry}
                onEditEntry={onEditEntry}
                title={tab.value === 'overview' ? 'Všechny záznamy' : `Záznamy - ${tab.label}`}
              />
            )}
          </TabsContent>
        ))}

        {/* Month tabs content */}
        {availableMonths.map(monthKey => (
          <TabsContent key={monthKey} value={monthKey} className="space-y-6">
            <TimeSummary 
              entries={groupedEntries[monthKey] || []} 
              period={getMonthName(monthKey)}
              realSalary={realSalaries ? realSalaries[monthKey] : undefined}
              onSetRealSalary={onSetRealSalary ? (amount) => onSetRealSalary(monthKey, amount) : undefined}
              onAddVacationHours={onAddVacationHours ? (hours) => onAddVacationHours(monthKey, hours) : undefined}
            />
            <TimeEntryList
              entries={groupedEntries[monthKey] || []}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              title={`Záznamy - ${getMonthName(monthKey)}`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}