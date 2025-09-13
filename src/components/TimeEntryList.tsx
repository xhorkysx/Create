import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, Edit } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TimeEntry) => void;
  title?: string;
}

export function TimeEntryList({ entries, onDeleteEntry, onEditEntry, title }: TimeEntryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return hours.toString().replace('.', ',');
  };

  const getWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return weekdays[date.getDay()];
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Záznamy'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Žádné záznamy nebyly nalezeny
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Záznamy'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Den</TableHead>
              <TableHead>Hodiny</TableHead>
              <TableHead>Sazba</TableHead>
              <TableHead>Výdělek</TableHead>
              <TableHead className="w-[100px]">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => {
                // Recalculate earnings for vacation entries if they are 0
                const displayEarnings = entry.isVacation && entry.earnings === 0 
                  ? entry.hours * 250 
                  : entry.earnings;
                
                return (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell className="font-medium">{getWeekday(entry.date)}</TableCell>
                  <TableCell>{formatHours(entry.hours)}h</TableCell>
                  <TableCell>
                    {entry.isVacation ? 'Dovolená' : formatCurrency(entry.hourlyRate) + '/h'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(displayEarnings)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!entry.isVacation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditEntry(entry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Upravit</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Smazat</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}