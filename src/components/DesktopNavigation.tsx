import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Home, 
  Clock, 
  Users, 
  Car, 
  Fuel, 
  AlertTriangle, 
  Phone, 
  UserCog,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  mode: string | null;
  description: string;
}

interface DesktopNavigationProps {
  currentMode: string | null;
  onModeChange: (mode: string | null) => void;
}

export function DesktopNavigation({ currentMode, onModeChange }: DesktopNavigationProps) {
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Domů',
      icon: <Home className="h-4 w-4" />,
      mode: null,
      description: 'Hlavní stránka'
    },
    {
      id: 'shifts',
      label: 'Směny',
      icon: <Clock className="h-4 w-4" />,
      mode: 'shifts',
      description: 'Přehled směn'
    },
    {
      id: 'driver-card',
      label: 'Karta řidiče',
      icon: <Car className="h-4 w-4" />,
      mode: 'entry',
      description: 'Doklady a dokumenty'
    },
    {
      id: 'time-tracking',
      label: 'Hodiny',
      icon: <Clock className="h-4 w-4" />,
      mode: 'time-tracking',
      description: 'Odpracované hodiny'
    },
    {
      id: 'consumption',
      label: 'Spotřeba',
      icon: <Fuel className="h-4 w-4" />,
      mode: 'consumption-record',
      description: 'Záznam spotřeby'
    },
    {
      id: 'gas-station',
      label: 'Čerpací stanice',
      icon: <Fuel className="h-4 w-4" />,
      mode: 'gas-station',
      description: 'Správa stanic'
    },
    {
      id: 'fault-reporting',
      label: 'Závady',
      icon: <AlertTriangle className="h-4 w-4" />,
      mode: 'fault-reporting',
      description: 'Hlášení závad'
    },
    {
      id: 'transport-contacts',
      label: 'Kontakty',
      icon: <Phone className="h-4 w-4" />,
      mode: 'transport-contacts',
      description: 'Doprava - Kontakty'
    }
  ];

  // Přidáme správu uživatelů pouze pro administrátory
  if (user?.role === 'admin') {
    navigationItems.push({
      id: 'user-management',
      label: 'Uživatelé',
      icon: <UserCog className="h-4 w-4" />,
      mode: 'user-management',
      description: 'Správa uživatelů'
    });
  }

  return (
        <Card className="w-64 modern-card">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Navigace</span>
          </div>
          
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentMode === item.mode;
              
              return (
                <Button
                  key={item.id}
                  onClick={() => onModeChange(item.mode)}
                  variant={isActive ? "default" : "ghost"}
                className={`justify-start h-auto p-3 text-left desktop-nav-item ${
                  isActive 
                    ? 'desktop-nav-active text-white' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white flex-shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
