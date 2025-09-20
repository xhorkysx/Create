import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, Shield, User, Calendar, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Načtení seznamu uživatelů
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      if (import.meta.env.DEV) {
        // Mock API pro lokální vývoj
        const { mockApiService } = await import('../services/mockApi.js');
        const data = await mockApiService.getUsers();
        setUsers(data.users || []);
      } else {
        // Skutečné API pro produkci
        const response = await fetch('/.netlify/functions/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Nepodařilo se načíst uživatele');
        }

        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  // Registrace nového uživatele
  const handleCreateUser = async () => {
    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setError('Prosím vyplňte všechny povinné údaje');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (import.meta.env.DEV) {
        // Mock API pro lokální vývoj
        const { mockApiService } = await import('../services/mockApi.js');
        await mockApiService.register(
          newUser.username.trim(),
          newUser.email.trim(),
          newUser.password
        );
      } else {
        // Skutečné API pro produkci
        const response = await fetch('/.netlify/functions/auth', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'register',
            username: newUser.username.trim(),
            email: newUser.email.trim(),
            password: newUser.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nepodařilo se vytvořit uživatele');
        }
      }

      setSuccess('Uživatel byl úspěšně vytvořen');
      setNewUser({ username: '', email: '', password: '', confirmPassword: '' });
      setIsDialogOpen(false);
      loadUsers(); // Obnovit seznam uživatelů
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Smazání uživatele
  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === currentUser?.id) {
      setError('Nemůžete smazat svůj vlastní účet');
      return;
    }

    if (!confirm(`Opravdu chcete smazat uživatele "${username}"? Tato akce je nevratná.`)) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (import.meta.env.DEV) {
        // Mock API pro lokální vývoj
        const { mockApiService } = await import('../services/mockApi.js');
        await mockApiService.deleteUser(userId);
      } else {
        // Skutečné API pro produkci
        const response = await fetch('/.netlify/functions/users', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nepodařilo se smazat uživatele');
        }
      }

      setSuccess('Uživatel byl úspěšně smazán');
      loadUsers(); // Obnovit seznam uživatelů
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Přístup odepřen</h2>
        <p className="text-muted-foreground">
          Tato stránka je dostupná pouze pro administrátory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Správa uživatelů</h1>
          <p className="text-muted-foreground">
            Vytváření a správa uživatelských účtů
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nový uživatel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Vytvořit nového uživatele</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Uživatelské jméno</Label>
                <Input
                  id="username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Zadejte uživatelské jméno"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Zadejte email"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Zadejte heslo (min. 6 znaků)"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Zadejte heslo znovu"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={isLoading}
                >
                  {isLoading ? 'Vytvářím...' : 'Vytvořit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zprávy */}
      {error && (
        <Alert>
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Seznam uživatelů */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seznam uživatelů ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Načítání uživatelů...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Uživatelské jméno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Vytvořen</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                        {user.username}
                        {user.id === currentUser?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Vy
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrátor' : 'Uživatel'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
