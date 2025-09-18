import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ConsumptionEntry {
  id: string;
  date: string;
  fuelConsumption?: number;
  kilometers: number;
  averageConsumption: number;
  notes?: string;
}

interface ConsumptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<ConsumptionEntry, 'id'>) => void;
  selectedDate: string;
  editingEntry?: ConsumptionEntry | null;
}

export function ConsumptionDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  editingEntry 
}: ConsumptionDialogProps) {
  const [formData, setFormData] = useState({
    date: selectedDate,
    kilometers: '',
    averageConsumption: '',
    notes: ''
  });

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        date: editingEntry.date,
        kilometers: editingEntry.kilometers.toString(),
        averageConsumption: editingEntry.averageConsumption.toString(),
        notes: editingEntry.notes || ''
      });
    } else {
      setFormData({
        date: selectedDate,
        kilometers: '',
        averageConsumption: '',
        notes: ''
      });
    }
  }, [editingEntry, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const kilometers = parseFloat(formData.kilometers);
    const averageConsumption = parseFloat(formData.averageConsumption);
    
    if (isNaN(kilometers) || isNaN(averageConsumption) || 
        kilometers <= 0 || averageConsumption <= 0) {
      alert('Prosím zadejte platné hodnoty pro všechny pole');
      return;
    }

    const entryData = {
      date: formData.date,
      kilometers,
      averageConsumption,
      notes: formData.notes
    };

    console.log('ConsumptionDialog - calling onSave with:', entryData);
    onSave(entryData);
  };

  const handleClose = () => {
    setFormData({
      date: selectedDate,
      kilometers: '',
      averageConsumption: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md w-full max-w-md"
        style={{ 
          maxWidth: '448px', 
          width: '448px',
          minWidth: '448px',
          overflow: 'hidden'
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? 'Upravit záznam spotřeby' : 'Nový záznam spotřeby'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="kilometers">Ujeté kilometry (km)</Label>
            <Input
              id="kilometers"
              type="number"
              step="1"
              min="0"
              value={formData.kilometers}
              onChange={(e) => setFormData(prev => ({ ...prev, kilometers: e.target.value }))}
              placeholder="Např. 320"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="averageConsumption">Průměrná spotřeba (l/100km)</Label>
            <Input
              id="averageConsumption"
              type="number"
              step="0.1"
              min="0"
              value={formData.averageConsumption}
              onChange={(e) => setFormData(prev => ({ ...prev, averageConsumption: e.target.value }))}
              placeholder="Např. 14.2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Poznámky (volitelné)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Např. Dlouhá trasa na Slovensko"
              rows={3}
              className="resize-none"
              style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordBreak: 'break-all',
                maxWidth: '100%',
                width: '100%',
                boxSizing: 'border-box',
                overflowX: 'hidden',
                overflowY: 'auto',
                minHeight: '80px',
                maxHeight: '120px'
              }}
            />
          </div>
          
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingEntry ? 'Uložit změny' : 'Přidat záznam'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Zrušit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
