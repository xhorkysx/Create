import React, { useState, useEffect, useCallback } from 'react';
import { TimeEntryForm } from './components/TimeEntryForm';
import { TimeTrackingTabs } from './components/TimeTrackingTabs';
import { EditEntryDialog } from './components/EditEntryDialog';
import { DriverCard } from './components/DriverCard';
import { CEPROLogo } from './components/CEPROLogo';
import { DispatcherInfo } from './components/DispatcherInfo';
import { LoginButton } from './components/LoginButton';
import { ManagementMessages } from './components/ManagementMessages';
import { ShiftsInfo } from './components/ShiftsInfo';
import { ConsumptionDialog } from './components/ConsumptionDialog';
import { ConsumptionCalendar } from './components/ConsumptionCalendar';
import { ConsumptionChart } from './components/ConsumptionChart';
import { UserManagement } from './components/UserManagement';
import { DesktopLayout } from './components/DesktopLayout';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet';
import { Download, Upload, Database, ChevronLeft, Home, Menu, Users } from 'lucide-react';
import { useIsMobile } from './components/ui/use-mobile';
import { apiService } from './services/api';
import { realtimeService } from './services/realtime';
import { AuthProvider, useAuth } from './contexts/AuthContext';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface ConsumptionEntry {
  id: string;
  date: string;
  fuelConsumption?: number; // v litrech - volitelné
  kilometers: number;
  averageConsumption: number; // l/100km
  notes?: string;
}


interface AppData {
  entries: TimeEntry[];
  defaultHourlyRate: number;
  realSalaries: { [key: string]: number };
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [currentMode, setCurrentMode] = useState(null);
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(250);
  const [realSalaries, setRealSalaries] = useState({});
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState({ isConnected: false, usePolling: false });
  const [isInDriverCardSection, setIsInDriverCardSection] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  
  const toggleNavigation = () => {
    console.log('=== HAMBURGER CLICKED ===');
    setIsNavigationOpen(prev => {
      console.log('Previous state:', prev, 'New state:', !prev);
      return !prev;
    });
  };
  
  // Consumption record states
  const [consumptionEntries, setConsumptionEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isConsumptionDialogOpen, setIsConsumptionDialogOpen] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState(null);
  const [currentChartMonth, setCurrentChartMonth] = useState(new Date());

  // Load time entries from database
  const loadTimeEntries = async () => {
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
        
        // Load data from database
        await loadTimeEntries();
      } catch (error) {
        console.error('Database initialization failed:', error);
        // Continue with localStorage fallback
        setDbInitialized(false);
        
        // Load data from localStorage as fallback
        const savedEntries = localStorage.getItem('timeTrackingEntries');
        if (savedEntries) {
          try {
            setEntries(JSON.parse(savedEntries));
          } catch (error) {
            console.error('Error loading entries:', error);
          }
        }
      }

      // Load other data from localStorage
      const savedRate = localStorage.getItem('defaultHourlyRate');
      const savedSalaries = localStorage.getItem('realSalaries');
      
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

  // Load consumption data
  useEffect(() => {
    loadConsumptionEntries();
  }, []);


  const addEntry = async (entryData) => {
    if (dbInitialized) {
      try {
        await apiService.addTimeEntry(entryData);
        // Reload data from database to ensure UI is updated
        await loadTimeEntries();
      } catch (error) {
        console.error('Error adding entry to database:', error);
        // Fallback to localStorage
        const newEntry = {
          ...entryData,
          id: Date.now().toString(),
          earnings: entryData.hours * entryData.hourlyRate
        };
        setEntries(prev => [newEntry, ...prev]);
      }
    } else {
      const newEntry = {
        ...entryData,
        id: Date.now().toString(),
        earnings: entryData.hours * entryData.hourlyRate
      };
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
          // Reload data from database to ensure UI is updated
          await loadTimeEntries();
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

  const editEntry = (entry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const saveEditedEntry = async (updatedEntry) => {
    if (dbInitialized) {
      try {
        await apiService.updateTimeEntry(updatedEntry.id, updatedEntry);
        // Reload data from database to ensure UI is updated
        await loadTimeEntries();
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

  // Consumption record functions
  const loadConsumptionEntries = async () => {
    try {
      // TODO: Implement API call to load consumption entries from database
      // For now, start with empty array - user will add their own data
      const initialEntries: ConsumptionEntry[] = [];
      setConsumptionEntries(initialEntries);
    } catch (error) {
      console.error('Error loading consumption entries:', error);
    }
  };


  const saveConsumptionEntry = async (entry) => {
    try {
      console.log('saveConsumptionEntry called with:', entry);
      console.log('editingConsumption:', editingConsumption);
      
      if (editingConsumption) {
        // Update existing entry
        const updatedEntry = {
          ...entry,
          id: editingConsumption.id
        };

        console.log('Updating existing entry:', updatedEntry);
        // TODO: Save to database
        setConsumptionEntries(prev => {
          const newEntries = prev.map(e => e.id === editingConsumption.id ? updatedEntry : e);
          console.log('Updated consumptionEntries:', newEntries);
          return newEntries;
        });
        
      } else {
        // Create new entry
        const newEntry = {
          ...entry,
          id: Date.now().toString()
        };

        console.log('Creating new entry:', newEntry);
        // TODO: Save to database
        setConsumptionEntries(prev => {
          const newEntries = [newEntry, ...prev];
          console.log('New consumptionEntries:', newEntries);
          return newEntries;
        });
        
      }
      
      setIsConsumptionDialogOpen(false);
      setEditingConsumption(null);
    } catch (error) {
      console.error('Error saving consumption entry:', error);
    }
  };

  const deleteConsumptionEntry = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento záznam spotřeby?')) {
      try {
        const entry = consumptionEntries.find(e => e.id === id);
        if (entry) {
          // TODO: Delete from database
          setConsumptionEntries(prev => prev.filter(e => e.id !== id));
          
        }
      } catch (error) {
        console.error('Error deleting consumption entry:', error);
      }
    }
  };


  const addVacationHours = (monthKey, hours) => {
    const [year, month] = monthKey.split('-');
    const hoursNum = parseFloat(hours.toString());
    const vacationEntry = {
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
    const data = {
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
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result || '{}'));
        
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
        <div className="text-center space-y-6">
          <div 
            className="animate-logo-grow"
            style={{
              animation: 'logo-grow 2s ease-in-out infinite'
            }}
          >
            <CEPROLogo />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Připravujeme databázi a načítáme data...
          </p>
        </div>
      </div>
    );
  }

  // Entry screen component - now using DesktopLayout for desktop, mobile fallback for small screens
  const EntryScreen = () => {
    if (isMobile) {
      // Mobile layout - keep original design
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-8">
            <div>
              {/* Logo a dispečink vedle sebe */}
              <div className="mb-8 flex items-center justify-center gap-6">
                <CEPROLogo />
                <DispatcherInfo />
                <LoginButton 
                  showRegisterButton={user?.role === 'admin'}
                />
              </div>
              
              {/* Informační okna */}
              <div className="mb-6 space-y-4">
                {/* Zprávy od vedení */}
                <ManagementMessages />
              </div>
              
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center px-4 max-w-2xl mx-auto">
              <Button 
                onClick={() => setCurrentMode('shifts')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Směny
              </Button>
              <Button 
                onClick={() => setCurrentMode('entry')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Karta řidiče
              </Button>
              <Button 
                onClick={() => setCurrentMode('time-tracking')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Odpracované hodiny
              </Button>
              <Button 
                onClick={() => setCurrentMode('consumption-record')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Záznam spotřeby
              </Button>
              <Button 
                onClick={() => setCurrentMode('gas-station')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Čerpací stanice
              </Button>
              <Button 
                onClick={() => setCurrentMode('fault-reporting')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Hlášení závad
              </Button>
              <Button 
                onClick={() => setCurrentMode('transport-contacts')}
                size="lg"
                className="w-full h-16 text-lg"
              >
                Doprava - Kontakty
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  onClick={() => setCurrentMode('user-management')}
                  size="lg"
                  className="w-full h-16 text-lg"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Správa uživatelů
                </Button>
              )}
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
    }

    // Desktop layout - use new DesktopLayout component
    return (
      <DesktopLayout 
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        dbInitialized={dbInitialized}
        realtimeStatus={realtimeStatus}
      />
    );
  };

  // Time tracking mode component
  const TimeTrackingMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                {isMobile && (
                  <button
                    onClick={toggleNavigation}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
                    title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
                  >
                    <Menu className="h-6 w-6 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
                  title="Zpět na výběr"
                >
                  <Home className="h-6 w-6 text-gray-600" />
                </button>
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
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            {isInDriverCardSection && (
              <button
                onClick={() => setIsInDriverCardSection(false)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
                title="Zpět na sekce"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground">
            Správa dokladů, interních dokumentů a přístupů do středisek
          </p>
        </div>
        
        <DriverCard 
          onBackToSections={isInDriverCardSection ? () => setIsInDriverCardSection(false) : undefined}
          onSectionEnter={() => setIsInDriverCardSection(true)}
        />
      </div>
    </div>
  );

  // Shifts mode component
  const ShiftsMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <h1>Směny</h1>
          </div>
          <p className="text-muted-foreground">
            Přehled směn podle aktuálního data
          </p>
        </div>
        
        <ShiftsInfo />
      </div>
    </div>
  );

  // Transport contacts mode component
  const TransportContactsMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <h1>Doprava - Kontakty</h1>
          </div>
          <p className="text-muted-foreground">
            Správa kontaktů pro dopravu a logistiku
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚛</div>
          <h2 className="text-2xl font-bold mb-2">Doprava - Kontakty</h2>
          <p className="text-muted-foreground">
            Tato funkce bude brzy dostupná
          </p>
        </div>
      </div>
    </div>
  );

  // Consumption record mode component
  const ConsumptionRecordMode = () => {
    const [currentChartMonth, setCurrentChartMonth] = useState(new Date());
    
    const handleDateSelect = (date) => {
      setSelectedDate(date);
    };

    const handleAddConsumption = (dateString) => {
      // Parse dateString as local date to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setIsConsumptionDialogOpen(true);
      setEditingConsumption(null);
    };

    const handleEditConsumption = (entry) => {
      setEditingConsumption(entry);
      setIsConsumptionDialogOpen(true);
    };

    const handleMonthChange = (month) => {
      setCurrentChartMonth(month);
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              {isMobile && (
                <button
                  onClick={toggleNavigation}
                  className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
                  title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
                >
                  <Menu className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
                title="Zpět na výběr"
              >
                <Home className="h-6 w-6 text-gray-600" />
              </button>
              <h1>Záznam spotřeby</h1>
            </div>
            <p className="text-muted-foreground">
              Sledování a zaznamenávání spotřeby paliva pro každou směnu
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="lg:col-span-1">
              <ConsumptionChart entries={consumptionEntries} currentMonth={currentChartMonth} />
            </div>
            
            {/* Calendar */}
            <div className="lg:col-span-1">
              <ConsumptionCalendar
                consumptionEntries={consumptionEntries}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onAddConsumption={handleAddConsumption}
                onEditConsumption={handleEditConsumption}
                onDeleteConsumption={deleteConsumptionEntry}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>

        </div>

        {/* Consumption Dialog */}
        <ConsumptionDialog
          isOpen={isConsumptionDialogOpen}
          onClose={() => {
            setIsConsumptionDialogOpen(false);
            setEditingConsumption(null);
          }}
          onSave={(entry) => saveConsumptionEntry(entry)}
          selectedDate={selectedDate.getFullYear() + '-' + 
            String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
            String(selectedDate.getDate()).padStart(2, '0')}
          editingEntry={editingConsumption}
        />
      </div>
    );
  };

  // Gas station mode component
  const GasStationMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <h1>Čerpací stanice</h1>
          </div>
          <p className="text-muted-foreground">
            Správa čerpacích stanic a jejich informací
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold mb-2">Čerpací stanice</h2>
          <p className="text-muted-foreground">
            Tato funkce bude brzy dostupná
          </p>
        </div>
      </div>
    </div>
  );

  // Fault reporting mode component
  const FaultReportingMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <h1>Hlášení závad</h1>
          </div>
          <p className="text-muted-foreground">
            Zaznamenávání a sledování závad a problémů
          </p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Hlášení závad</h2>
              <p className="text-muted-foreground">
                Vyberte typ závady, kterou chcete nahlásit
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  // TODO: Implementovat hlášení závad na čerpacích stanicích
                  alert('Hlášení závad na čerpacích stanicích - funkce bude brzy dostupná');
                }}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                🏪 Hlášení závad na čerpacích stanicích
              </Button>
              
              <Button 
                onClick={() => {
                  // TODO: Implementovat hlášení závad na CA
                  alert('Hlášení závad na CA - funkce bude brzy dostupná');
                }}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                🏢 Hlášení závad na CA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // User management mode component
  const UserManagementMode = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleNavigation}
              className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title={isNavigationOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMode(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors border border-gray-300 relative z-50"
              title="Zpět na výběr"
            >
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <h1>Správa uživatelů</h1>
          </div>
          <p className="text-muted-foreground">
            Vytváření a správa uživatelských účtů
          </p>
        </div>
        
        <UserManagement />
      </div>
    </div>
  );


  // Navigation panel component using Sheet
  const NavigationPanel = () => (
    <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
      <SheetContent side="top" className="w-64 h-auto" style={{ left: '16px', right: 'auto', top: '16px', bottom: 'auto', width: '256px' }}>
        <SheetHeader>
          <SheetTitle>Navigace</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          <Button 
            onClick={() => {
              setCurrentMode(null);
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === null ? 'default' : 'outline'}
          >
            <Home className="h-4 w-4 mr-2" />
            Domů
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('shifts');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'shifts' ? 'default' : 'outline'}
          >
            Směny
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('entry');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'entry' ? 'default' : 'outline'}
          >
            Karta řidiče
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('time-tracking');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'time-tracking' ? 'default' : 'outline'}
          >
            Odpracované hodiny
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('consumption-record');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'consumption-record' ? 'default' : 'outline'}
          >
            Záznam spotřeby
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('gas-station');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'gas-station' ? 'default' : 'outline'}
          >
            Čerpací stanice
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('fault-reporting');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'fault-reporting' ? 'default' : 'outline'}
          >
            Hlášení závad
          </Button>
          <Button 
            onClick={() => {
              setCurrentMode('transport-contacts');
              setIsNavigationOpen(false);
            }}
            className="w-full justify-start h-12 text-lg"
            variant={currentMode === 'transport-contacts' ? 'default' : 'outline'}
          >
            Doprava - Kontakty
          </Button>
          {user?.role === 'admin' && (
            <Button 
              onClick={() => {
                setCurrentMode('user-management');
                setIsNavigationOpen(false);
              }}
              className="w-full justify-start h-12 text-lg"
              variant={currentMode === 'user-management' ? 'default' : 'outline'}
            >
              <Users className="h-4 w-4 mr-2" />
              Správa uživatelů
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Main render logic - pro desktop vždy použij DesktopLayout
  if (!isMobile) {
    return (
      <DesktopLayout 
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        dbInitialized={dbInitialized}
        realtimeStatus={realtimeStatus}
        entries={entries}
        onAddEntry={addEntry}
        onDeleteEntry={deleteEntry}
        onEditEntry={editEntry}
        defaultHourlyRate={defaultHourlyRate}
        realSalaries={realSalaries}
        onSetRealSalary={setRealSalary}
        onAddVacationHours={addVacationHours}
        consumptionEntries={consumptionEntries}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAddConsumption={(dateString) => {
          const [year, month, day] = dateString.split('-').map(Number);
          setSelectedDate(new Date(year, month - 1, day));
          setIsConsumptionDialogOpen(true);
          setEditingConsumption(null);
        }}
        onEditConsumption={(entry) => {
          setEditingConsumption(entry);
          setIsConsumptionDialogOpen(true);
        }}
        onDeleteConsumption={deleteConsumptionEntry}
        onMonthChange={setCurrentChartMonth}
        currentChartMonth={currentChartMonth}
      />
    );
  }

  // Mobile layout - hlavní stránka
  if (currentMode === null) {
    return (
      <>
        <EntryScreen />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  // Mobile módy (pouze pro mobilní zařízení)
  if (currentMode === 'entry') {
    return (
      <>
        <DriverCardMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'time-tracking') {
    return (
      <>
        <TimeTrackingMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'shifts') {
    return (
      <>
        <ShiftsMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'transport-contacts') {
    return (
      <>
        <TransportContactsMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'consumption-record') {
    return (
      <>
        <ConsumptionRecordMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'gas-station') {
    return (
      <>
        <GasStationMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'fault-reporting') {
    return (
      <>
        <FaultReportingMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }

  if (currentMode === 'user-management') {
    return (
      <>
        <UserManagementMode />
        {isNavigationOpen && <NavigationPanel />}
      </>
    );
  }


  return <EntryScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}