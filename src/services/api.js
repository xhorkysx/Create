// API služba pro komunikaci s Netlify Functions

import { realtimeService } from './realtime.js';
import { mockApiService } from './mockApi.js';
import { shouldUseMockApi } from '../config/api.js';
import { authService } from './auth.js';

const API_BASE = '/.netlify/functions';

class ApiService {
  // Inicializace databáze
  async initDatabase() {
    if (shouldUseMockApi) {
      return await mockApiService.initDatabase();
    }
    try {
      const response = await fetch(`${API_BASE}/init-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // DOKUMENTY API
  async getDocuments() {
    if (shouldUseMockApi) {
      return await mockApiService.getDocuments();
    }
    try {
      const response = await fetch(`${API_BASE}/documents`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async updateDocument(id, issueDate, expiryDate) {
    if (shouldUseMockApi) {
      return await mockApiService.updateDocument(id, issueDate, expiryDate);
    }
    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          issueDate,
          expiryDate
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('documents_updated', { id, issueDate, expiryDate });
      
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // ČASOVÉ ZÁZNAMY API
  async getTimeEntries() {
    if (shouldUseMockApi) {
      return await mockApiService.getTimeEntries();
    }
    try {
      const response = await fetch(`${API_BASE}/time-entries`, {
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  async addTimeEntry(entryData) {
    if (shouldUseMockApi) {
      return await mockApiService.addTimeEntry(entryData);
    }
    try {
      const response = await fetch(`${API_BASE}/time-entries`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('time_entries_updated', { action: 'add', data: entryData });
      
      return result;
    } catch (error) {
      console.error('Error adding time entry:', error);
      throw error;
    }
  }

  async updateTimeEntry(id, entryData) {
    if (shouldUseMockApi) {
      return await mockApiService.updateTimeEntry(id, entryData);
    }
    try {
      const response = await fetch(`${API_BASE}/time-entries`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          id,
          ...entryData
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('time_entries_updated', { action: 'update', id, data: entryData });
      
      return result;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }

  async deleteTimeEntry(id) {
    if (shouldUseMockApi) {
      return await mockApiService.deleteTimeEntry(id);
    }
    try {
      const response = await fetch(`${API_BASE}/time-entries?id=${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('time_entries_updated', { action: 'delete', id });
      
      return result;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }

  // SPRÁVA ZPRÁV API
  async getMessages() {
    if (shouldUseMockApi) {
      return await mockApiService.getMessages();
    }
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        headers: authService.getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async addMessage(messageData) {
    if (shouldUseMockApi) {
      return await mockApiService.addMessage(messageData);
    }
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou přidávat zprávy.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('messages_updated', { action: 'add', data: messageData });
      
      return result;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  async updateMessage(id, messageData) {
    if (shouldUseMockApi) {
      return await mockApiService.updateMessage(id, messageData);
    }
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          messageId: id,
          ...messageData
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou upravovat zprávy.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('messages_updated', { action: 'update', id, data: messageData });
      
      return result;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(id) {
    if (shouldUseMockApi) {
      return await mockApiService.deleteMessage(id);
    }
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ messageId: id }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou mazat zprávy.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Broadcast change to other clients
      realtimeService.broadcast('messages_updated', { action: 'delete', id });
      
      return result;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
