import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface AddMessageDialogProps {
  onMessageAdded?: () => void;
}

interface MessageFormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  author: string;
}

export function AddMessageDialog({ onMessageAdded }: AddMessageDialogProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MessageFormData>({
    title: '',
    content: '',
    type: 'info',
    author: user?.username || ''
  });

  // Kontrola, zda je uživatel admin
  const isAdmin = user?.role === 'admin';

  const handleInputChange = (field: keyof MessageFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      alert('Prosím vyplňte všechna povinná pole.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.addMessage(formData);
      
      // Reset formuláře
      setFormData({
        title: '',
        content: '',
        type: 'info',
        author: user?.username || ''
      });
      
      setIsOpen(false);
      
      // Zavolej callback pro aktualizaci seznamu zpráv
      if (onMessageAdded) {
        onMessageAdded();
      }
      
      // Zobrazit potvrzení
      alert('Zpráva byla úspěšně přidána!');
      
    } catch (error) {
      console.error('Error adding message:', error);
      alert(error instanceof Error ? error.message : 'Chyba při přidávání zprávy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      author: user?.username || ''
    });
    setIsOpen(false);
  };

  // Pokud uživatel není admin, nezobrazuj dialog
  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-8 w-8 p-0" size="sm" title="Přidat zprávu">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Přidat novou zprávu</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nadpis *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Zadejte nadpis zprávy"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Obsah *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Zadejte obsah zprávy"
              rows={4}
              disabled={isLoading}
              required
              className="resize-none whitespace-pre-wrap break-words"
              style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ zprávy *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte typ zprávy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informace</SelectItem>
                <SelectItem value="warning">Upozornění</SelectItem>
                <SelectItem value="success">Úspěch</SelectItem>
                <SelectItem value="urgent">Naléhavé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Autor *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Zadejte jméno autora"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Přidávám...
                </>
              ) : (
                'Přidat zprávu'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
