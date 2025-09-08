import React, { useState, useEffect } from 'react';
import { TimeEntryForm } from './components/TimeEntryForm';
import { TimeTrackingTabs } from './components/TimeTrackingTabs';
import { EditEntryDialog } from './components/EditEntryDialog';
import { DriverCard } from './components/DriverCard';
import { Button } from './components/ui/button';
import { Download, Upload, Database } from 'lucide-react';
import { useIsMobile } from './components/ui/use-mobile';
import { apiService } from './services/api';
import { realtimeService } from './services/realtime';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface AppData {
  entries: TimeEntry[];
  defaultHourlyRate: number;
  realSalaries: { [key: string]: number };
}

export default function App() {
  const isMobile = useIsMobile();
  const [currentMode, setCurrentMode] = useState<'entry' | 'time-tracking' | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(250);
  const [realSalaries, setRealSalaries] = useState<{ [key: string]: number }>({});
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState({ isConnected: false, usePolling: false });

  // Load time entries from database
  const loadTimeEntries = async () => {
    if (!dbInitialized) return;
    
    try {
      const dbEntries = await apiService.getTimeEntries();
      setEntries(dbEntries);
    } catch (error) {
      console.error('Error loading time entries from database:', error);
    }
  };

  // Initialize database and load data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to initialize database first
        await apiService.initDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization failed:', error);
        // Continue with localStorage fallback
        setDbInitialized(false);
      }

      // Load data from localStorage as fallback
      const savedEntries = localStorage.getItem('timeTrackingEntries');
      const savedRate = localStorage.getItem('defaultHourlyRate');
      const savedSalaries = localStorage.getItem('realSalaries');
      
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch (error) {
          console.error('Error loading entries:', error);
        }
      }
      
      if (savedRate) {
        setDefaultHourlyRate(parseInt(savedRate));
      }
      
      if (savedSalaries) {
        try {
          setRealSalaries(JSON.parse(savedSalaries));
        } catch (error) {
          console.error('Error loading salaries:', error);
        }
      }

      // Connect to real-time service
      realtimeService.connect();

      // Subscribe to real-time updates
      const unsubscribeTimeEntries = realtimeService.subscribe('time_entries', (data) => {
        console.log('Real-time time entries update:', data);
        // Reload time entries from database
        if (dbInitialized) {
          loadTimeEntries();
        }
      });

      const unsubscribeDocuments = realtimeService.subscribe('documents', (data) => {
        console.log('Real-time documents update:', data);
        // Documents will be reloaded by DriverCard component
      });

      const unsubscribeConnection = realtimeService.subscribe('connection', (data) => {
        console.log('Real-time connection status:', data);
        setRealtimeStatus(realtimeService.getConnectionStatus());
      });

      setIsInitializing(false);

      // Cleanup on unmount
      return () => {
        unsubscribeTimeEntries();
        unsubscribeDocuments();
        unsubscribeConnection();
        realtimeService.disconnect();
      };
    };

    initializeApp();
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('timeTrackingEntries', JSON.stringify(entries));
  }, [entries]);

  // Save default hourly rate
  useEffect(() => {
    localStorage.setItem('defaultHourlyRate', defaultHourlyRate.toString());
  }, [defaultHourlyRate]);

  // Save real salaries
  useEffect(() => {
    localStorage.setItem('realSalaries', JSON.stringify(realSalaries));
  }, [realSalaries]);

  const addEntry = async (entryData: Omit<TimeEntry, 'id' | 'earnings'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      earnings: entryData.hours * entryData.hourlyRate
    };
    
    if (dbInitialized) {
      try {
        await apiService.addTimeEntry(newEntry);
        // Real-time update will handle the UI refresh
      } catch (error) {
        console.error('Error adding entry to database:', error);
        // Fallback to localStorage
        setEntries(prev => [newEntry, ...prev]);
      }
    } else {
      setEntries(prev => [newEntry, ...prev]);
    }
    
    // Update default hourly rate
    setDefaultHourlyRate(entryData.hourlyRate);
  };

  const deleteEntry = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento záznam?')) {
      if (dbInitialized) {
        try {
          await apiService.deleteTimeEntry(id);
          // Real-time update will handle the UI refresh
        } catch (error) {
          console.error('Error deleting entry from database:', error);
          // Fallback to localStorage
          setEntries(prev => prev.filter(entry => entry.id !== id));
        }
      } else {
        setEntries(prev => prev.filter(entry => entry.id !== id));
      }
    }
  };

  const editEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const saveEditedEntry = async (updatedEntry: TimeEntry) => {
    if (dbInitialized) {
      try {
        await apiService.updateTimeEntry(updatedEntry.id, updatedEntry);
        // Real-time update will handle the UI refresh
      } catch (error) {
        console.error('Error updating entry in database:', error);
        // Fallback to localStorage
        setEntries(prev => 
          prev.map(entry => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          )
        );
      }
    } else {
      setEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
    }
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const setRealSalary = (monthKey: string, amount: number) => {
    setRealSalaries(prev => ({
      ...prev,
      [monthKey]: amount
    }));
  };

  const addVacationHours = (monthKey: string, hours: number) => {
    const [year, month] = monthKey.split('-');
    const hoursNum = parseFloat(hours.toString());
    const vacationEntry: TimeEntry = {
      id: Date.now().toString(),
      date: `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`,
      hours: hoursNum,
      hourlyRate: 250,
      earnings: hoursNum * 250,
      isVacation: true
    };
    
    setEntries(prev => [vacationEntry, ...prev]);
  };

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      await apiService.initDatabase();
      setDbInitialized(true);
      alert('Databáze byla úspěšně inicializována!');
    } catch (error) {
      console.error('Error initializing database:', error);
      alert('Chyba při inicializaci databáze. Zkontrolujte konzoli prohlížeče.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Export data to JSON file
  const exportData = () => {
    const data: AppData = {
      entries,
      defaultHourlyRate,
      realSalaries
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-tracking-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const importData = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: AppData = JSON.parse(e.target?.result as string);
        
        if (data.entries) setEntries(data.entries);
        if (data.defaultHourlyRate) setDefaultHourlyRate(data.defaultHourlyRate);
        if (data.realSalaries) setRealSalaries(data.realSalaries);
        
        alert('Data byla úspěšně načtena!');
      } catch (error) {
        alert('Chyba při načítání souboru. Zkontrolujte, že je to platný JSON soubor.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Loading screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Inicializace aplikace</h1>
            <p className="text-muted-foreground">
              Připravujeme databázi a načítáme data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Entry screen component
  const EntryScreen = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Vítejte v aplikaci</h1>
          <p className="text-muted-foreground text-lg">
            Vyberte režim, který chcete použít
          </p>
          {dbInitialized && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Database className="h-4 w-4" />
                Databáze připojena
              </div>
              {realtimeStatus.isConnected && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  realtimeStatus.usePolling 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    realtimeStatus.usePolling ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}></div>
                  {realtimeStatus.usePolling ? 'Synchronizace (polling)' : 'Real-time synchronizace'}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button 
            onClick={() => setCurrentMode('entry')}
            size="lg"
            className="w-full sm:w-auto min-w-[200px] h-16 text-lg"
          >
            Karta řidiče
          </Button>
          <Button 
            onClick={() => setCurrentMode('time-tracking')}
            size="lg"
            className="w-full sm:w-auto min-w-[200px] h-16 text-lg"
          >
            Odpracované hodiny
          </Button>
        </div>
        
        {!dbInitialized && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Databáze není dostupná. Používá se localStorage.
            </p>
            <Button 
              onClick={initializeDatabase}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isInitializing}
            >
              <Database className="h-4 w-4" />
              {isInitializing ? 'Inicializace...' : 'Zkusit připojit databázi'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Time tracking mode component
  const TimeTrackingMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  onClick={() => setCurrentMode(null)}
                  variant="outline"
                  size="sm"
                >
                  ← Zpět na výběr
                </Button>
                <h1>Sledování odpracovaných hodin</h1>
              </div>
              <p className="text-muted-foreground">
                Zaznamenejte si své pracovní hodiny a sledujte své výdělky
              </p>
            </div>
            {!isMobile && (
              <div className="flex gap-2">
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export dat
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    style={{ display: 'none' }}
                    id="import-file"
                  />
                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import dat
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <TimeEntryForm 
            onAddEntry={addEntry} 
            defaultHourlyRate={defaultHourlyRate} 
          />
          
          <TimeTrackingTabs
            entries={entries}
            onDeleteEntry={deleteEntry}
            onEditEntry={editEntry}
            realSalaries={realSalaries}
            onSetRealSalary={setRealSalary}
            onAddVacationHours={addVacationHours}
          />
        </div>

        <EditEntryDialog
          entry={editingEntry}
          open={isEditDialogOpen}
          onClose={closeEditDialog}
          onSave={saveEditedEntry}
        />
      </div>
    </div>
  );

  // Driver card mode component
  const DriverCardMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              onClick={() => setCurrentMode(null)}
              variant="outline"
              size="sm"
            >
              ← Zpět na výběr
            </Button>
            <h1>Karta řidiče</h1>
          </div>
          <p className="text-muted-foreground">
            Správa dokladů, interních dokumentů a přístupů do středisek
          </p>
        </div>
        
        <DriverCard />
      </div>
    </div>
  );

  // Main render logic
  if (currentMode === null) {
    return <EntryScreen />;
  }

  if (currentMode === 'entry') {
    return <DriverCardMode />;
  }

  if (currentMode === 'time-tracking') {
    return <TimeTrackingMode />;
  }

  return <EntryScreen />;
}