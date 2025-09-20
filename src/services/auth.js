// Autentifikační služba pro komunikaci s Netlify Functions

import { mockApiService } from './mockApi.js';
import { shouldUseMockApi } from '../config/api.js';

const API_BASE = '/.netlify/functions';

class AuthService {
  // Získání aktuálního tokenu
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Kontrola, zda je uživatel přihlášen
  isAuthenticated() {
    return !!this.getToken();
  }

  // Přihlášení uživatele
  async login(username, password) {
    if (shouldUseMockApi) {
      return await mockApiService.login(username, password);
    }

    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Přihlášení se nezdařilo');
      }

      const data = await response.json();
      
      // Uložení tokenu
      localStorage.setItem('authToken', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Registrace nového uživatele
  async register(username, email, password) {
    if (shouldUseMockApi) {
      return await mockApiService.register(username, email, password);
    }

    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registrace se nezdařila');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Ověření tokenu a získání informací o uživateli
  async verifyToken() {
    if (shouldUseMockApi) {
      return await mockApiService.verifyToken(this.getToken());
    }

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token,
        }),
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      throw error;
    }
  }

  // Odhlášení uživatele
  logout() {
    localStorage.removeItem('authToken');
  }

  // Získání hlaviček s autentifikací pro API volání
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const authService = new AuthService();
