import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LogIn, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackComponent?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  fallbackComponent 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Zobrazit loading spinner během načítání
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Načítání...</h1>
            <p className="text-muted-foreground">
              Ověřujeme vaše přihlášení...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pokud uživatel není přihlášen
  if (!isAuthenticated) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <LogIn className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Přihlášení vyžadováno</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Pro přístup k této stránce se musíte přihlásit.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Obnovit stránku
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pokud je vyžadována admin role
  if (requireAdmin && user?.role !== 'admin') {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Nedostatečná oprávnění</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Pro přístup k této stránce potřebujete administrátorská oprávnění.
            </p>
            <p className="text-sm text-muted-foreground">
              Váš účet: <span className="font-medium">{user?.username}</span> ({user?.role})
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Obnovit stránku
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Všechny kontroly prošly, zobrazit obsah
  return <>{children}</>;
};
