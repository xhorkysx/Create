import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  earnings: number;
}

interface TimeSummaryProps {
  entries: TimeEntry[];
}

export function TimeSummary({ entries }: TimeSummaryProps) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalEarnings = entries.reduce((sum, entry) => sum + entry.earnings, 0);
  const averageHourlyRate = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.hourlyRate, 0) / entries.length 
    : 0;

  // Calculate this month's stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
  
  const thisMonthHours = thisMonthEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const thisMonthEarnings = thisMonthEntries.reduce((sum, entry) => sum + entry.earnings, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const stats = [
    {
      title: 'Celkové hodiny',
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      description: `${entries.length} záznamů`
    },
    {
      title: 'Celkový výdělek',
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      description: 'Za všechny záznamy'
    },
    {
      title: 'Tento měsíc',
      value: `${thisMonthHours.toFixed(1)}h`,
      icon: Calendar,
      description: formatCurrency(thisMonthEarnings)
    },
    {
      title: 'Průměrná sazba',
      value: formatCurrency(averageHourlyRate),
      icon: TrendingUp,
      description: 'Za hodinu'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}