import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  earnings: number;
}

interface EditEntryDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
}

export function EditEntryDialog({ entry, open, onClose, onSave }: EditEntryDialogProps) {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setHours(entry.hours.toString());
      setHourlyRate(entry.hourlyRate.toString());
      setDescription(entry.description);
    }
  }, [entry]);

  const handleSave = () => {
    if (!entry) return;

    const hoursNum = parseFloat(hours);
    const rateNum = parseFloat(hourlyRate);
    
    if (!hoursNum || !rateNum || hoursNum <= 0 || rateNum <= 0) {
      alert('Prosím zadejte platné hodnoty pro hodiny a sazbu');
      return;
    }

    const updatedEntry: TimeEntry = {
      ...entry,
      date,
      hours: hoursNum,
      hourlyRate: rateNum,
      description,
      earnings: hoursNum * rateNum
    };

    onSave(updatedEntry);
    onClose();
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upravit záznam</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Datum</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-hours">Počet hodin</Label>
            <Input
              id="edit-hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-hourlyRate">Hodinová sazba (Kč)</Label>
            <Input
              id="edit-hourlyRate"
              type="number"
              step="1"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Popis práce</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zrušit
          </Button>
          <Button onClick={handleSave}>
            Uložit změny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}