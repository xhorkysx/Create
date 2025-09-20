import React from 'react';
import { CEPROLogo } from './CEPROLogo';
import { DispatcherInfo } from './DispatcherInfo';
import { LoginButton } from './LoginButton';
import { ManagementMessages } from './ManagementMessages';
import { DesktopNavigation } from './DesktopNavigation';
import { ShiftsInfo } from './ShiftsInfo';
import { DriverCard } from './DriverCard';
import { TimeEntryForm } from './TimeEntryForm';
import { TimeTrackingTabs } from './TimeTrackingTabs';
import { ConsumptionDialog } from './ConsumptionDialog';
import { ConsumptionCalendar } from './ConsumptionCalendar';
import { ConsumptionChart } from './ConsumptionChart';
import { UserManagement } from './UserManagement';
import { Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DesktopLayoutProps {
  currentMode: string | null;
  onModeChange: (mode: string | null) => void;
  dbInitialized: boolean;
  realtimeStatus: { isConnected: boolean; usePolling: boolean };
  // Props pro předání dat do komponent
  entries?: any[];
  onAddEntry?: (entry: any) => void;
  onDeleteEntry?: (id: string) => void;
  onEditEntry?: (entry: any) => void;
  defaultHourlyRate?: number;
  realSalaries?: { [key: string]: number };
  onSetRealSalary?: (monthKey: string, amount: number) => void;
  onAddVacationHours?: (monthKey: string, hours: number) => void;
  consumptionEntries?: any[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAddConsumption?: (dateString: string) => void;
  onEditConsumption?: (entry: any) => void;
  onDeleteConsumption?: (id: string) => void;
  onMonthChange?: (month: Date) => void;
  currentChartMonth?: Date;
}

export function DesktopLayout({ 
  currentMode, 
  onModeChange, 
  dbInitialized, 
  realtimeStatus,
  entries = [],
  onAddEntry,
  onDeleteEntry,
  onEditEntry,
  defaultHourlyRate = 250,
  realSalaries = {},
  onSetRealSalary,
  onAddVacationHours,
  consumptionEntries = [],
  selectedDate = new Date(),
  onDateSelect,
  onAddConsumption,
  onEditConsumption,
  onDeleteConsumption,
  onMonthChange,
  currentChartMonth = new Date()
}: DesktopLayoutProps) {
  const { user } = useAuth();


  const getSectionName = (mode: string | null) => {
    switch (mode) {
      case 'shifts': return 'Směny';
      case 'entry': return 'Karta řidiče';
      case 'time-tracking': return 'Odpracované hodiny';
      case 'consumption-record': return 'Záznam spotřeby';
      case 'gas-station': return 'Čerpací stanice';
      case 'fault-reporting': return 'Hlášení závad';
      case 'transport-contacts': return 'Doprava - Kontakty';
      case 'user-management': return 'Správa uživatelů';
      default: return 'Neznámá sekce';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header s logem a informacemi */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="smooth-transition">
                <CEPROLogo />
              </div>
              <div className="smooth-transition">
                <DispatcherInfo />
              </div>
            </div>
            <div className="smooth-transition">
              <LoginButton 
                showRegisterButton={user?.role === 'admin'}
              />
            </div>
          </div>
          
          {/* Status indikátory */}
          {dbInitialized && (
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm smooth-transition hover:shadow-md">
                <Database className="h-4 w-4" />
                Databáze připojena
              </div>
              {realtimeStatus.isConnected && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm smooth-transition hover:shadow-md ${
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

        {/* Hlavní obsah s navigací a obsahem */}
        <div className="desktop-grid">
          {/* Navigační panel - vždy viditelný na desktopu */}
          <div className="desktop-nav smooth-transition">
            <DesktopNavigation 
              currentMode={currentMode}
              onModeChange={onModeChange}
            />
          </div>
          
          {/* Hlavní obsah - zprávy pro hlavní stránku, jiný obsah pro ostatní sekce */}
          <div className="desktop-content smooth-transition">
            {currentMode === null ? (
              <ManagementMessages />
            ) : currentMode === 'shifts' ? (
              <ShiftsInfo />
            ) : currentMode === 'entry' ? (
              <DriverCard />
            ) : currentMode === 'time-tracking' ? (
              <div className="space-y-6">
                <TimeEntryForm 
                  onAddEntry={onAddEntry} 
                  defaultHourlyRate={defaultHourlyRate} 
                />
                <TimeTrackingTabs
                  entries={entries}
                  onDeleteEntry={onDeleteEntry}
                  onEditEntry={onEditEntry}
                  realSalaries={realSalaries}
                  onSetRealSalary={onSetRealSalary}
                  onAddVacationHours={onAddVacationHours}
                />
              </div>
            ) : currentMode === 'consumption-record' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ConsumptionChart entries={consumptionEntries} currentMonth={currentChartMonth} />
                <ConsumptionCalendar
                  consumptionEntries={consumptionEntries}
                  selectedDate={selectedDate}
                  onDateSelect={onDateSelect}
                  onAddConsumption={onAddConsumption}
                  onEditConsumption={onEditConsumption}
                  onDeleteConsumption={onDeleteConsumption}
                  onMonthChange={onMonthChange}
                />
              </div>
            ) : currentMode === 'user-management' ? (
              <UserManagement />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold mb-2">Sekce v přípravě</h2>
                <p className="text-muted-foreground">
                  Obsah pro sekci "{getSectionName(currentMode)}" bude brzy dostupný
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
