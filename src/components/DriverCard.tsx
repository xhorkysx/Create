import React, { useState } from 'react';

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

  // Initialize data directly in state
  const [data, setData] = useState({
    documents: [
      {
        id: 'id-card',
        name: 'Občanský průkaz',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'driving-license',
        name: 'Řidičský průkaz',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'adr-card',
        name: 'ADR průkaz',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      }
    ],
    internal: [
      {
        id: 'cybersecurity',
        name: 'Kybernetická bezpečnost',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'health-check',
        name: 'Zdravotní prohlídka',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'compliance',
        name: 'Compliance',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'pc-passwords',
        name: 'Hesla do PC',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      }
    ],
    centers: [
      {
        id: 'strelice',
        name: 'Střelice',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'slapanov',
        name: 'Šlapánov',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'loukov',
        name: 'Loukov',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      },
      {
        id: 'sedlnice',
        name: 'Sedlnice',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        daysRemaining: 3650,
        isExpired: false,
        isExpiringSoon: false
      }
    ]
  });

  const startEditing = (type: string, id: string) => {
    const item = data[type as keyof typeof data].find(item => item.id === id);
    if (item) {
      setEditingItem({ type, id });
      setEditForm({
        issueDate: item.issueDate,
        expiryDate: item.expiryDate
      });
    }
  };

  const saveEdit = () => {
    if (!editingItem) return;

    const updatedData = {
      ...data,
      [editingItem.type]: data[editingItem.type as keyof typeof data].map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              issueDate: editForm.issueDate,
              expiryDate: editForm.expiryDate,
              daysRemaining: Math.ceil((new Date(editForm.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
            }
          : item
      )
    };

    setData(updatedData);
    setEditingItem(null);
    setEditForm({ issueDate: '', expiryDate: '' });
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
    const items = data[type];

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-blue-600">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <span 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={getStatusStyle(item, type)}
                >
                  {getStatusText(item, type)}
                </span>
              </div>
              
              {editingItem?.type === type && editingItem?.id === item.id ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Datum vydání</label>
                      <input
                        type="date"
                        value={editForm.issueDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Datum vypršení</label>
                      <input
                        type="date"
                        value={editForm.expiryDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={saveEdit}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      Uložit
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      Zrušit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">Vyprší:</span>
                      <p className="font-medium">{formatDate(item.expiryDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Zbývá dnů:</span>
                      <p 
                        className="font-medium"
                        style={{
                          color: item.daysRemaining < 0 ? '#dc2626' : 
                                 item.daysRemaining <= getWarningThreshold(item, type) ? '#ea580c' : 
                                 '#16a34a'
                        }}
                      >
                        {item.daysRemaining}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => startEditing(type, item.id)}
                    className="mt-3 w-full px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    Upravit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Karta řidiče</h2>
      
      {/* All tables on one page */}
      {renderTable('documents', 'Doklady')}
      {renderTable('internal', 'Interní dokumenty')}
      {renderTable('centers', 'Střediska')}
    </div>
  );
}