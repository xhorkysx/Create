import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { realtimeService } from '../services/realtime';
import { DriverCardNavigation } from './DriverCardNavigation';

interface DocumentItem {
  id: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export function DriverCard() {
  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(null);
  const [editForm, setEditForm] = useState({ issueDate: '', expiryDate: '' });
  const [data, setData] = useState({
    documents: [],
    internal: [],
    centers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'documents' | 'internal' | 'centers' | null>(null);

  // Načtení dat z API
  useEffect(() => {
    loadDocuments();

    // Subscribe to real-time document updates
    const unsubscribe = realtimeService.subscribe('documents', (data) => {
      console.log('Real-time documents update received:', data);
      loadDocuments(); // Reload documents when changes are detected
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const documents = await apiService.getDocuments();
      setData(documents);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Chyba při načítání dokumentů');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (type: string, id: string) => {
    console.log('Starting edit for:', type, id);
    console.log('Available data:', data);
    const item = data[type as keyof typeof data].find(item => item.id === id);
    console.log('Found item:', item);
    if (item) {
      setEditingItem({ type, id });
      setEditForm({
        issueDate: item.issueDate,
        expiryDate: item.expiryDate
      });
      console.log('Edit mode activated');
    } else {
      console.error('Item not found for editing');
    }
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      setError(null);
      // Při ukládání posíláme jen expiryDate, issueDate zůstává původní
      const originalItem = data[editingItem.type as keyof typeof data].find(item => item.id === editingItem.id);
      const originalIssueDate = originalItem ? originalItem.issueDate : '';
      
      await apiService.updateDocument(editingItem.id, originalIssueDate, editForm.expiryDate);
      
      // Reload data from API
      await loadDocuments();
      
      setEditingItem(null);
      setEditForm({ issueDate: '', expiryDate: '' });
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Chyba při ukládání dokumentu');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ issueDate: '', expiryDate: '' });
  };


  const getWarningThreshold = (item: DocumentItem, type: string) => {
    // Doklady a Zdravotní prohlídka: 45 dnů
    if (type === 'documents' || item.id === 'health-check') {
      return 45;
    }
    // Kybernetická bezpečnost, Compliance, Hesla do PC: 21 dnů
    if (item.id === 'cybersecurity' || item.id === 'compliance' || item.id === 'pc-passwords') {
      return 21;
    }
    // Střediska: 14 dnů
    if (type === 'centers') {
      return 14;
    }
    // Výchozí: 30 dnů
    return 30;
  };

  const getStatusText = (item: DocumentItem, type: string) => {
    const threshold = getWarningThreshold(item, type);
    if (item.daysRemaining < 0) {
      return 'Vypršel';
    } else if (item.daysRemaining <= threshold) {
      return 'Brzy vyprší';
    } else {
      return 'Platný';
    }
  };

  const getStatusStyle = (item: DocumentItem, type: string) => {
    const threshold = getWarningThreshold(item, type);
    if (item.daysRemaining < 0) {
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    } else if (item.daysRemaining <= threshold) {
      return { backgroundColor: '#fed7aa', color: '#9a3412' };
    } else {
      return { backgroundColor: '#dcfce7', color: '#166534' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const renderTable = (type: keyof typeof data, title: string) => {
    const items = data[type].sort((a, b) => {
      // Seřadíme podle data vypršení platnosti (nejdříve vypršící první)
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA.getTime() - dateB.getTime();
    });

    // Najdeme nejdelší název dokladu pro nastavení šířky prvního sloupce
    const maxNameLength = Math.max(...items.map(item => item.name.length));
    const nameColumnWidth = Math.max(maxNameLength * 8 + 20, 150); // 8px na znak + padding, minimum 150px

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-blue-600">{title}</h3>
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className={`py-3 ${index < items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                {(() => {
                  const isEditing = editingItem?.type === type && editingItem?.id === item.id;
                  console.log('Rendering item:', item.id, 'isEditing:', isEditing, 'editingItem:', editingItem);
                  return isEditing;
                })() ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Datum vypršení platnosti</label>
                      <input
                        type="date"
                        value={editForm.expiryDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={saveEdit}
                        className="flex-1 px-4 py-2 rounded text-base font-bold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm border border-green-600"
                        style={{ 
                          backgroundColor: '#16a34a', 
                          color: '#ffffff', 
                          fontSize: '16px', 
                          fontWeight: 'bold',
                          border: '2px solid #16a34a'
                        }}
                      >
                        ✓ Uložit
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      >
                        ✗ Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 text-xs">
                    <div className="font-semibold text-sm flex-shrink-0" style={{ width: `${nameColumnWidth}px` }}>
                      {item.name}
                    </div>
                    <div className="font-medium flex-shrink-0" style={{ minWidth: '100px' }}>
                      {formatDate(item.expiryDate)}
                    </div>
                    <div 
                      className="font-medium flex-shrink-0 text-center"
                      style={{
                        color: item.daysRemaining < 0 ? '#dc2626' : 
                               item.daysRemaining <= getWarningThreshold(item, type) ? '#ea580c' : 
                               '#16a34a',
                        minWidth: '80px'
                      }}
                    >
                      {item.daysRemaining}
                    </div>
                    <div className="flex-shrink-0">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={getStatusStyle(item, type)}
                      >
                        {getStatusText(item, type)}
                      </span>
                    </div>
                    <button 
                      onClick={() => startEditing(type, item.id)}
                      className="ml-auto px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                    >
                      Upravit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Karta řidiče</h2>
        <div className="text-center py-8">
          <p>Načítání dokumentů...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Karta řidiče</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDocuments}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Karta řidiče</h2>
      
      {!activeSection ? (
        <DriverCardNavigation 
          onSectionSelect={setActiveSection}
          activeSection={activeSection}
        />
      ) : (
        <div>
          <div className="mb-6">
            <button 
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Zpět na výběr sekce
            </button>
          </div>
          
          {activeSection === 'documents' && renderTable('documents', 'Doklady')}
          {activeSection === 'internal' && renderTable('internal', 'Interní dokumenty')}
          {activeSection === 'centers' && renderTable('centers', 'Střediska - vstupy')}
        </div>
      )}
    </div>
  );
}