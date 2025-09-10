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
      description: 'ADR průkaz, Řidičský průkaz, Občanský průkaz, Karta do tachografu',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'internal' as const,
      title: 'Interní dokumenty',
      description: 'Compliance, Hesla do PC, Kybernetická bezpečnost, Zdravotní prohlídka',
      icon: Shield,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'centers' as const,
      title: 'Střediska - vstupy',
      description: 'Střelice, Loukov, Šlapánov, Klobouky, Cerekvice, Sedlnice, Smyslov, Mstětice',
      icon: Building2,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Vyberte sekci</h3>
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
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-sm opacity-80 leading-relaxed">{item.description}</p>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
