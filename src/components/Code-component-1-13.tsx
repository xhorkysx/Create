import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  earnings: number;
}

interface TimeEntryFormProps {
  onAddEntry: (entry: Omit<TimeEntry, 'id' | 'earnings'>) => void;
  defaultHourlyRate: number;
}

export function TimeEntryForm({ onAddEntry, defaultHourlyRate }: TimeEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState(defaultHourlyRate.toString());
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hoursNum = parseFloat(hours);
    const rateNum = parseFloat(hourlyRate);
    
    if (!hoursNum || !rateNum || hoursNum <= 0 || rateNum <= 0) {
      alert('Prosím zadejte platné hodnoty pro hodiny a sazbu');
      return;
    }

    onAddEntry({
      date,
      hours: hoursNum,
      hourlyRate: rateNum,
      description
    });

    // Reset form
    setHours('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Přidat nový záznam</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Počet hodin</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="8"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hodinová sazba (Kč)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="1"
              min="0"
              placeholder="500"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis práce (volitelné)</Label>
            <Textarea
              id="description"
              placeholder="Popis vykonané práce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Přidat záznam
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}