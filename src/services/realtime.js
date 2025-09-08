class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 second
    this.pollingInterval = null;
    this.pollingDelay = 5000; // 5 seconds
    this.lastUpdateTime = Date.now();
    this.usePolling = false;
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    // Check if EventSource is supported
    if (typeof EventSource !== 'undefined') {
      this.usePolling = false;
      this.connectSSE();
    } else {
      console.log('EventSource not supported, falling back to polling');
      this.usePolling = true;
      this.startPolling();
    }
  }

  connectSSE() {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.eventSource = new EventSource(`/api/events?clientId=${clientId}`);
    
    this.eventSource.onopen = () => {
      console.log('Real-time connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyListeners('connection', { status: 'connected' });
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing real-time message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      this.isConnected = false;
      this.notifyListeners('connection', { status: 'disconnected' });
      this.handleReconnect();
    };
  }

  startPolling() {
    this.isConnected = true;
    this.notifyListeners('connection', { status: 'connected_polling' });
    
    this.pollingInterval = setInterval(async () => {
      try {
        // Check for updates by polling the database
        // This is a simplified version - in production you'd want a more efficient endpoint
        const response = await fetch('/api/poll-updates');
        if (response.ok) {
          const data = await response.json();
          if (data.hasUpdates) {
            this.handleMessage({ type: 'polling_update', data: data.updates });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.pollingDelay);
  }

  handleMessage(data) {
    console.log('Real-time message received:', data);
    
    switch (data.type) {
      case 'connected':
        console.log('Connected with client ID:', data.clientId);
        break;
      case 'documents_updated':
        this.notifyListeners('documents', data.data);
        break;
      case 'time_entries_updated':
        this.notifyListeners('time_entries', data.data);
        break;
      case 'database_initialized':
        this.notifyListeners('database', data.data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.usePolling) {
          this.startPolling();
        } else {
          this.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached, falling back to polling');
      this.usePolling = true;
      this.startPolling();
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  notifyListeners(eventType, data) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time listener:', error);
        }
      });
    }
  }

  broadcast(type, data) {
    return fetch('/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data })
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.listeners.clear();
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      usePolling: this.usePolling
    };
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();
