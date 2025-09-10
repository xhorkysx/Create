import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Clock, DollarSign, Calendar, TrendingUp, Plus, X } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface TimeSummaryProps {
  entries: TimeEntry[];
  period?: string;
  realSalary?: number;
  onSetRealSalary?: (amount: number) => void;
  onAddVacationHours?: (hours: number) => void;
}

export function TimeSummary({ entries, period, realSalary, onSetRealSalary, onAddVacationHours }: TimeSummaryProps) {
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [showHoursInput, setShowHoursInput] = useState(false);
  const [hoursInput, setHoursInput] = useState('');

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  // Always show calculated earnings for the current period (month)
  const totalEarnings = entries.reduce((sum, entry) => sum + entry.earnings, 0);
  const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(amount);
  };

  const handleSetSalary = () => {
    const amount = parseFloat(salaryInput);
    if (amount > 0 && onSetRealSalary) {
      onSetRealSalary(amount);
      setSalaryInput('');
      setShowSalaryInput(false);
    }
  };

  const handleAddVacationHours = () => {
    const hours = parseFloat(hoursInput);
    if (hours > 0 && onAddVacationHours) {
      onAddVacationHours(hours);
      setHoursInput('');
      setShowHoursInput(false);
    }
  };

  const stats = [
    {
      title: `Celkové hodiny${period ? ` - ${period}` : ''}`,
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      description: `${entries.length} záznamů`,
      showHoursInput: showHoursInput,
      onToggleHoursInput: () => setShowHoursInput(!showHoursInput),
      onAddVacationHours: handleAddVacationHours,
      hoursInput: hoursInput,
      onHoursInputChange: setHoursInput
    },
    {
      title: 'Předpokládaný výdělek',
      value: `${formatCurrency(totalHours * 230)} - ${formatCurrency(totalHours * 280)}`,
      icon: TrendingUp,
      description: '230-280 Kč/h'
    },
    {
      title: 'Celkový výdělek - aktuální měsíc',
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      description: period || new Date().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
      realSalary: realSalary,
      showSalaryInput: showSalaryInput,
      onToggleSalaryInput: () => setShowSalaryInput(!showSalaryInput),
      onSetSalary: handleSetSalary,
      salaryInput: salaryInput,
      onSalaryInputChange: setSalaryInput
    },
    {
      title: 'Průměr za den',
      value: entries.length > 0 ? `${(totalHours / entries.length).toFixed(1)}h` : '0h',
      icon: Calendar,
      description: entries.length > 0 ? formatCurrency(totalEarnings / entries.length) : formatCurrency(0)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isEarningsCard = index === 2; // Celkový výdělek je třetí karta
        const isHoursCard = index === 0; // Celkové hodiny je první karta
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              
              {/* Real Salary Input for Earnings Card */}
              {isEarningsCard && onSetRealSalary && (
                <div className="mt-4 space-y-2">
                  {stat.realSalary !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reálná výplata:</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(stat.realSalary)}
                      </span>
                    </div>
                  )}
                  {!stat.showSalaryInput ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stat.onToggleSalaryInput}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {stat.realSalary !== undefined ? 'Upravit reálnou výplatu' : 'Nastavit reálnou výplatu'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Zadejte částku"
                          value={stat.salaryInput}
                          onChange={(e) => stat.onSalaryInputChange(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={stat.onSetSalary}
                        >
                          Uložit
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stat.onToggleSalaryInput}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Zrušit
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Vacation Hours Input for Hours Card */}
              {isHoursCard && stat.showHoursInput !== undefined && onAddVacationHours && (
                <div className="mt-4 space-y-2">
                  {!stat.showHoursInput ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stat.onToggleHoursInput}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Přidat dovolenou
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Počet hodin"
                          value={stat.hoursInput}
                          onChange={(e) => stat.onHoursInputChange(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={stat.onAddVacationHours}
                        >
                          Přidat
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stat.onToggleHoursInput}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Zrušit
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}