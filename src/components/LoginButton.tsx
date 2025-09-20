import React, { useState } from 'react';
import { Button } from './ui/button';
import { User, LogIn, LogOut, UserPlus, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

interface LoginButtonProps {
  showRegisterButton?: boolean;
}

export function LoginButton({ 
  showRegisterButton = false 
}: LoginButtonProps) {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Prosím vyplňte uživatelské jméno a heslo');
      return;
    }

    setIsLoadingAuth(true);
    setError('');
    try {
      await login(loginUsername.trim(), loginPassword);
      setIsDialogOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setSuccess('Přihlášení úspěšné!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Přihlášení se nezdařilo');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRegister = async () => {
    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('Prosím vyplňte všechny povinné údaje');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    setIsLoadingAuth(true);
    setError('');
    try {
      await register(registerUsername.trim(), registerEmail.trim(), registerPassword);
      setSuccess('Registrace úspěšná! Můžete se přihlásit.');
      // Přepnutí na přihlašovací tab
      setTimeout(() => {
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Registrace se nezdařila');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccess('Odhlášení úspěšné!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'login' | 'register') => {
    if (e.key === 'Enter') {
      if (action === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Načítání...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          {user.role === 'admin' ? (
            <Shield className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span className="font-medium">{user.username}</span>
          {user.role === 'admin' && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
              Admin
            </span>
          )}
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
    <>
      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-4">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            
            {error && (
              <Alert className="mb-4">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Přihlášení</TabsTrigger>
                <TabsTrigger value="register" disabled={!showRegisterButton}>
                  Registrace
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Uživatelské jméno</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'login')}
                    placeholder="Zadejte uživatelské jméno"
                    disabled={isLoadingAuth}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Heslo</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'login')}
                    placeholder="Zadejte heslo"
                    disabled={isLoadingAuth}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoadingAuth}
                  >
                    Zrušit
                  </Button>
                  <Button
                    onClick={handleLogin}
                    disabled={isLoadingAuth}
                  >
                    {isLoadingAuth ? 'Přihlašuji...' : 'Přihlásit'}
                  </Button>
                </div>
              </TabsContent>
              
              {showRegisterButton && (
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Uživatelské jméno</Label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'register')}
                      placeholder="Zadejte uživatelské jméno"
                      disabled={isLoadingAuth}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'register')}
                      placeholder="Zadejte email"
                      disabled={isLoadingAuth}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Heslo</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'register')}
                      placeholder="Zadejte heslo (min. 6 znaků)"
                      disabled={isLoadingAuth}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Potvrzení hesla</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'register')}
                      placeholder="Zadejte heslo znovu"
                      disabled={isLoadingAuth}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoadingAuth}
                    >
                      Zrušit
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={isLoadingAuth}
                    >
                      {isLoadingAuth ? 'Registruji...' : 'Registrovat'}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
