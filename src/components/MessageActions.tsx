import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface ManagementMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  author: string;
  isRead: boolean;
}

interface MessageActionsProps {
  message: ManagementMessage;
  onMessageUpdated?: () => void;
  onMessageDeleted?: () => void;
}

interface EditFormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  author: string;
}

export function MessageActions({ message, onMessageUpdated, onMessageDeleted }: MessageActionsProps) {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: message.title,
    content: message.content,
    type: message.type,
    author: message.author
  });

  // Kontrola, zda je uživatel admin
  const isAdmin = user?.role === 'admin';

  // Pokud uživatel není admin, nezobrazuj akce
  if (!isAdmin) {
    return null;
  }

  const handleEditInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.title.trim() || !editFormData.content.trim() || !editFormData.author.trim()) {
      alert('Prosím vyplňte všechna povinná pole.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.updateMessage(message.id, editFormData);
      
      setIsEditDialogOpen(false);
      
      // Zavolej callback pro aktualizaci seznamu zpráv
      if (onMessageUpdated) {
        onMessageUpdated();
      }
      
      // Zobrazit potvrzení
      alert('Zpráva byla úspěšně aktualizována!');
      
    } catch (error) {
      console.error('Error updating message:', error);
      alert(error instanceof Error ? error.message : 'Chyba při aktualizaci zprávy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await apiService.deleteMessage(message.id);
      
      // Zavolej callback pro aktualizaci seznamu zpráv
      if (onMessageDeleted) {
        onMessageDeleted();
      }
      
      // Zobrazit potvrzení
      alert('Zpráva byla úspěšně smazána!');
      
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(error instanceof Error ? error.message : 'Chyba při mazání zprávy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditFormData({
      title: message.title,
      content: message.content,
      type: message.type,
      author: message.author
    });
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Smazat zprávu</AlertDialogTitle>
              <AlertDialogDescription>
                Opravdu chcete smazat zprávu "{message.title}"? Tato akce je nevratná.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Zrušit</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mažu...
                  </>
                ) : (
                  'Smazat'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upravit zprávu</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Nadpis *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => handleEditInputChange('title', e.target.value)}
                placeholder="Zadejte nadpis zprávy"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Obsah *</Label>
              <Textarea
                id="edit-content"
                value={editFormData.content}
                onChange={(e) => handleEditInputChange('content', e.target.value)}
                placeholder="Zadejte obsah zprávy"
                rows={4}
                disabled={isLoading}
                required
                className="resize-none whitespace-pre-wrap break-words"
                style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Typ zprávy *</Label>
              <Select
                value={editFormData.type}
                onValueChange={(value) => handleEditInputChange('type', value)}
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
              <Label htmlFor="edit-author">Autor *</Label>
              <Input
                id="edit-author"
                value={editFormData.author}
                onChange={(e) => handleEditInputChange('author', e.target.value)}
                placeholder="Zadejte jméno autora"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleEditCancel}
                disabled={isLoading}
              >
                Zrušit
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Ukládám...
                  </>
                ) : (
                  'Uložit změny'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
