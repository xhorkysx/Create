import React, { useState, useEffect } from 'react';
import { FileText, Shield, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { apiService } from '../services/api';

interface DriverCardNavigationProps {
  onSectionSelect: (section: 'documents' | 'internal' | 'centers') => void;
  activeSection: 'documents' | 'internal' | 'centers' | null;
}

export function DriverCardNavigation({ onSectionSelect, activeSection }: DriverCardNavigationProps) {
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentsData();
  }, []);

  const loadDocumentsData = async () => {
    try {
      const data = await apiService.getDocuments();
      setDocumentsData(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiringDocuments = (type: string, maxDays: number = 45) => {
    if (!documentsData || !documentsData[type]) return [];
    
    return documentsData[type]
      .filter((doc: any) => doc.daysRemaining <= maxDays && doc.daysRemaining >= 0)
      .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining)
      .map((doc: any) => `${doc.name} (${doc.daysRemaining} dnů)`);
  };

  const getExpiringCenters = () => {
    if (!documentsData || !documentsData.centers) return null;
    
    const expiring = documentsData.centers
      .filter((center: any) => center.daysRemaining <= 14 && center.daysRemaining >= 0)
      .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);
    
    if (expiring.length === 0) return null;
    
    const nearest = expiring[0];
    return `${nearest.name} - vyprší za ${nearest.daysRemaining} dnů`;
  };

  const navigationItems = [
    {
      id: 'documents' as const,
      title: 'Doklady',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      subtitle: loading ? 'Načítání...' : getExpiringDocuments('documents', 45)[0] || null
    },
    {
      id: 'internal' as const,
      title: 'Interní dokumenty',
      icon: Shield,
      color: 'bg-green-500 hover:bg-green-600',
      subtitle: loading ? ['Načítání...'] : getExpiringDocuments('internal', 45)
    },
    {
      id: 'centers' as const,
      title: 'Střediska - vstupy',
      icon: Building2,
      color: 'bg-purple-500 hover:bg-purple-600',
      subtitle: loading ? 'Načítání...' : getExpiringCenters()
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
