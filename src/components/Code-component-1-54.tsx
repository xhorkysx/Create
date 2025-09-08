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
}

interface TimeTrackingTabsProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TimeEntry) => void;
}

export function TimeTrackingTabs({ entries, onDeleteEntry, onEditEntry }: TimeTrackingTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

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
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getEntryCount = (key: string) => {
    return groupedEntries[key]?.length || 0;
  };

  const tabs = [
    { value: 'overview', label: 'Přehled', entries: entries },
    ...availableYears.map(year => ({
      value: `year-${year}`,
      label: year.toString(),
      entries: groupedEntries[`year-${year}`] || []
    })),
    ...availableMonths.map(monthKey => ({
      value: monthKey,
      label: getMonthName(monthKey),
      entries: groupedEntries[monthKey] || []
    }))
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:flex lg:w-auto lg:h-auto">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
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
            />
            <TimeEntryList
              entries={tab.entries}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              title={tab.value === 'overview' ? 'Všechny záznamy' : `Záznamy - ${tab.label}`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}