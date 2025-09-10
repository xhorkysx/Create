import React from 'react';
import { FileText, Shield, Building2 } from 'lucide-react';
import { Button } from './ui/button';

interface DriverCardNavigationProps {
  onSectionSelect: (section: 'documents' | 'internal' | 'centers') => void;
  activeSection: 'documents' | 'internal' | 'centers' | null;
}

export function DriverCardNavigation({ onSectionSelect, activeSection }: DriverCardNavigationProps) {
  const navigationItems = [
    {
      id: 'documents' as const,
      title: 'Doklady',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      subtitle: 'ADR průkaz (45 dnů)'
    },
    {
      id: 'internal' as const,
      title: 'Interní dokumenty',
      icon: Shield,
      color: 'bg-green-500 hover:bg-green-600',
      subtitle: [
        'Kybernetická bezpečnost (5 dnů)',
        'Hesla do PC (10 dnů)', 
        'Compliance (15 dnů)'
      ]
    },
    {
      id: 'centers' as const,
      title: 'Střediska - vstupy',
      icon: Building2,
      color: 'bg-purple-500 hover:bg-purple-600',
      subtitle: 'Střelice - vyprší za 8 dnů'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => onSectionSelect(item.id)}
              variant={isActive ? "default" : "outline"}
              className={`h-auto p-6 flex flex-col items-center text-center transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'hover:shadow-md border-2 hover:border-primary/50'
              }`}
            >
              <IconComponent className={`h-12 w-12 mb-3 ${
                isActive ? 'text-primary-foreground' : 'text-primary'
              }`} />
              <h4 className="font-semibold text-lg">{item.title}</h4>
              {item.subtitle && (
                <div className="text-xs text-muted-foreground mt-1">
                  {Array.isArray(item.subtitle) ? (
                    item.subtitle.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))
                  ) : (
                    <div>{item.subtitle}</div>
                  )}
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
