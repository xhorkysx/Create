import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, Edit } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  earnings: number;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: TimeEntry) => void;
}

export function TimeEntryList({ entries, onDeleteEntry, onEditEntry }: TimeEntryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historie záznamů</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Zatím nemáte žádné záznamy. Přidejte svůj první záznam výše.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historie záznamů</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Hodiny</TableHead>
                <TableHead>Sazba</TableHead>
                <TableHead>Výdělek</TableHead>
                <TableHead>Popis</TableHead>
                <TableHead className="w-24">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.hours}h</TableCell>
                  <TableCell>{formatCurrency(entry.hourlyRate)}/h</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(entry.earnings)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditEntry(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Upravit</span>
                      </Button>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}