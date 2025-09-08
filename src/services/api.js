// API služba pro komunikaci s Netlify Functions

const API_BASE = '/.netlify/functions';

class ApiService {
  // Inicializace databáze
  async initDatabase() {
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
      
      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // ČASOVÉ ZÁZNAMY API
  async getTimeEntries() {
    try {
      const response = await fetch(`${API_BASE}/time-entries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  }

  async addTimeEntry(entryData) {
    try {
      const response = await fetch(`${API_BASE}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding time entry:', error);
      throw error;
    }
  }

  async updateTimeEntry(id, entryData) {
    try {
      const response = await fetch(`${API_BASE}/time-entries`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...entryData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }

  async deleteTimeEntry(id) {
    try {
      const response = await fetch(`${API_BASE}/time-entries?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
