import React, { useState } from 'react';
import { Button } from './ui/button';
import { User, LogIn, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginButtonProps {
  isLoggedIn?: boolean;
  onLogin?: (username: string, password: string) => void;
  onLogout?: () => void;
  currentUser?: string;
}

export function LoginButton({ 
  isLoggedIn = false, 
  onLogin, 
  onLogout, 
  currentUser 
}: LoginButtonProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Prosím vyplňte uživatelské jméno a heslo');
      return;
    }

    setIsLoading(true);
    try {
      if (onLogin) {
        await onLogin(username.trim(), password);
      }
      setIsLoginDialogOpen(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert('Přihlášení se nezdařilo. Zkontrolujte své údaje.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <User className="h-3 w-3" />
          <span className="font-medium">{currentUser || 'Uživatel'}</span>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="h-8 px-2"
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
        >
          <LogIn className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Přihlášení</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Zadejte uživatelské jméno"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Zadejte heslo"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLoginDialogOpen(false)}
              disabled={isLoading}
            >
              Zrušit
            </Button>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Přihlašuji...' : 'Přihlásit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
