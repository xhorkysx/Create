// Mock API služba pro lokální vývoj
// Tato služba simuluje backend API s předpřipravenými daty

class MockApiService {
  constructor() {
    // Mock data pro dokumenty
    this.mockDocuments = {
      documents: [
        {
          id: '1',
          name: 'ADR průkaz',
          issueDate: '2023-01-15',
          expiryDate: '2025-01-15',
          daysRemaining: 45,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '2',
          name: 'Řidičský průkaz',
          issueDate: '2022-06-01',
          expiryDate: '2027-06-01',
          daysRemaining: 1200,
          isExpired: false,
          isExpiringSoon: false
        },
        {
          id: '3',
          name: 'Občanský průkaz',
          issueDate: '2020-03-10',
          expiryDate: '2030-03-10',
          daysRemaining: 2000,
          isExpired: false,
          isExpiringSoon: false
        },
        {
          id: '4',
          name: 'Karta do tachografu',
          issueDate: '2023-08-20',
          expiryDate: '2025-08-20',
          daysRemaining: 300,
          isExpired: false,
          isExpiringSoon: false
        }
      ],
      internal: [
        {
          id: '5',
          name: 'Compliance',
          issueDate: '2023-12-01',
          expiryDate: '2024-12-01',
          daysRemaining: 15,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '6',
          name: 'Hesla do PC',
          issueDate: '2023-11-15',
          expiryDate: '2024-11-15',
          daysRemaining: 10,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '7',
          name: 'Kybernetická bezpečnost',
          issueDate: '2023-10-01',
          expiryDate: '2024-10-01',
          daysRemaining: 5,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '8',
          name: 'Zdravotní prohlídka',
          issueDate: '2023-09-01',
          expiryDate: '2025-09-01',
          daysRemaining: 400,
          isExpired: false,
          isExpiringSoon: false
        }
      ],
      centers: [
        {
          id: '9',
          name: 'Střelice',
          issueDate: '2023-12-01',
          expiryDate: '2024-12-01',
          daysRemaining: 8,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '10',
          name: 'Loukov',
          issueDate: '2023-11-20',
          expiryDate: '2024-11-20',
          daysRemaining: 3,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '11',
          name: 'Šlapánov',
          issueDate: '2023-10-15',
          expiryDate: '2024-10-15',
          daysRemaining: -5,
          isExpired: true,
          isExpiringSoon: false
        },
        {
          id: '12',
          name: 'Klobouky',
          issueDate: '2023-12-10',
          expiryDate: '2024-12-10',
          daysRemaining: 12,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '13',
          name: 'Cerekvice',
          issueDate: '2023-11-25',
          expiryDate: '2024-11-25',
          daysRemaining: 6,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '14',
          name: 'Sedlnice',
          issueDate: '2023-10-30',
          expiryDate: '2024-10-30',
          daysRemaining: -10,
          isExpired: true,
          isExpiringSoon: false
        },
        {
          id: '15',
          name: 'Smyslov',
          issueDate: '2023-12-05',
          expiryDate: '2024-12-05',
          daysRemaining: 9,
          isExpired: false,
          isExpiringSoon: true
        },
        {
          id: '16',
          name: 'Mstětice',
          issueDate: '2023-11-30',
          expiryDate: '2024-11-30',
          daysRemaining: 4,
          isExpired: false,
          isExpiringSoon: true
        }
      ]
    };

    // Mock data pro časové záznamy
    this.mockTimeEntries = [
      {
        id: '1',
        date: '2024-01-15',
        hours: 8,
        hourlyRate: 250,
        earnings: 2000,
        isHoliday: false,
        isVacation: false
      },
      {
        id: '2',
        date: '2024-01-14',
        hours: 7.5,
        hourlyRate: 250,
        earnings: 1875,
        isHoliday: false,
        isVacation: false
      }
    ];

    // Mock uživatelé
    this.mockUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@company.com',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'user',
        email: 'user@company.com',
        role: 'user',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ];

    // Mock zprávy od vedení
    this.mockMessages = [
      {
        id: '1',
        title: 'Důležité upozornění',
        content: 'Od příštího týdne se mění rozvrh směn. Více informací najdete v emailu.',
        type: 'warning',
        date: '2024-01-15',
        author: 'Vedení',
        isRead: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Nové bezpečnostní předpisy',
        content: 'Prosíme o dodržování nových bezpečnostních předpisů při práci s vozidly.',
        type: 'info',
        date: '2024-01-14',
        author: 'Bezpečnostní oddělení',
        isRead: true,
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-14T14:30:00Z'
      },
      {
        id: '3',
        title: 'Úspěšné dokončení projektu',
        content: 'Děkujeme všem za úspěšné dokončení projektu modernizace vozového parku.',
        type: 'success',
        date: '2024-01-13',
        author: 'Vedení',
        isRead: true,
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-13T09:15:00Z'
      }
    ];

    // Aktuálně přihlášený uživatel
    this.currentUser = null;
  }

  // DOKUMENTY API
  async getDocuments() {
    // Simulace network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockDocuments;
  }

  async updateDocument(id, issueDate, expiryDate) {
    // Simulace network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Najdi a aktualizuj dokument
    for (const category of Object.keys(this.mockDocuments)) {
      const doc = this.mockDocuments[category].find(d => d.id === id);
      if (doc) {
        doc.issueDate = issueDate;
        doc.expiryDate = expiryDate;
        doc.daysRemaining = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        doc.isExpired = new Date(expiryDate) < new Date();
        break;
      }
    }
    
    return { message: 'Document updated successfully' };
  }

  // ČASOVÉ ZÁZNAMY API
  async getTimeEntries() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTimeEntries;
  }

  async addTimeEntry(entryData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newEntry = {
      id: Date.now().toString(),
      ...entryData,
      earnings: entryData.hours * entryData.hourlyRate
    };
    
    this.mockTimeEntries.unshift(newEntry);
    return newEntry;
  }

  async updateTimeEntry(id, entryData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockTimeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.mockTimeEntries[index] = {
        ...this.mockTimeEntries[index],
        ...entryData,
        earnings: entryData.hours * entryData.hourlyRate
      };
    }
    
    return this.mockTimeEntries[index];
  }

  async deleteTimeEntry(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockTimeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.mockTimeEntries.splice(index, 1);
    }
    
    return { message: 'Time entry deleted successfully' };
  }

  // AUTENTIFIKACE API
  async login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock přihlášení - jednoduché ověření
    const user = this.mockUsers.find(u => 
      u.username === username && 
      ((username === 'admin' && password === 'admin123') || 
       (username === 'user' && password === 'user123'))
    );
    
    if (!user) {
      throw new Error('Neplatné přihlašovací údaje');
    }
    
    // Simulace JWT tokenu
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    this.currentUser = user;
    
    return {
      message: 'Přihlášení úspěšné',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  async register(username, email, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Kontrola, zda uživatel již existuje
    const existingUser = this.mockUsers.find(u => 
      u.username === username || u.email === email
    );
    
    if (existingUser) {
      throw new Error('Uživatel s tímto jménem nebo emailem již existuje');
    }
    
    // Vytvoření nového uživatele
    const newUser = {
      id: (this.mockUsers.length + 1).toString(),
      username,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    this.mockUsers.push(newUser);
    
    return {
      message: 'Uživatel byl úspěšně vytvořen',
      user: newUser
    };
  }

  async verifyToken(token) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new Error('Neplatný token');
    }
    
    // Extrahuj user ID z tokenu
    const parts = token.split('-');
    const userId = parts[3];
    
    const user = this.mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('Uživatel nebyl nalezen');
    }
    
    return {
      message: 'Token je platný',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      users: this.mockUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }))
    };
  }

  async deleteUser(userId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.mockUsers.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('Uživatel nebyl nalezen');
    }
    
    this.mockUsers.splice(index, 1);
    
    return { message: 'Uživatel byl úspěšně smazán' };
  }

  // SPRÁVA ZPRÁV API
  async getMessages() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { messages: this.mockMessages };
  }

  async addMessage(messageData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Kontrola, zda je uživatel admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou přidávat zprávy.');
    }
    
    const newMessage = {
      id: Date.now().toString(),
      title: messageData.title,
      content: messageData.content,
      type: messageData.type,
      date: new Date().toISOString().split('T')[0],
      author: messageData.author,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.mockMessages.unshift(newMessage);
    
    return {
      message: 'Zpráva byla úspěšně vytvořena',
      data: newMessage
    };
  }

  async updateMessage(id, messageData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Kontrola, zda je uživatel admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou upravovat zprávy.');
    }
    
    const index = this.mockMessages.findIndex(message => message.id === id);
    if (index === -1) {
      throw new Error('Zpráva nebyla nalezena');
    }
    
    this.mockMessages[index] = {
      ...this.mockMessages[index],
      ...messageData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      message: 'Zpráva byla úspěšně aktualizována',
      data: this.mockMessages[index]
    };
  }

  async deleteMessage(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Kontrola, zda je uživatel admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Nedostatečná oprávnění. Pouze administrátoři mohou mazat zprávy.');
    }
    
    const index = this.mockMessages.findIndex(message => message.id === id);
    if (index === -1) {
      throw new Error('Zpráva nebyla nalezena');
    }
    
    this.mockMessages.splice(index, 1);
    
    return { message: 'Zpráva byla úspěšně smazána' };
  }

  // Inicializace databáze (mock)
  async initDatabase() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      message: 'Database initialized successfully (mock mode)',
      tables: ['users', 'time_entries', 'driver_documents', 'app_settings', 'management_messages']
    };
  }
}

export const mockApiService = new MockApiService();
