import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageSquare, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface ManagementMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  author: string;
  isRead: boolean;
}

export function ManagementMessages() {
  const [messages, setMessages] = useState<ManagementMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - v budoucnu se budou načítat z API
      const mockMessages: ManagementMessage[] = [
        {
          id: '1',
          title: 'Důležité upozornění',
          content: 'Od příštího týdne se mění rozvrh směn. Více informací najdete v emailu.',
          type: 'warning',
          date: '2024-01-15',
          author: 'Vedení',
          isRead: false
        },
        {
          id: '2',
          title: 'Nové bezpečnostní předpisy',
          content: 'Prosíme o dodržování nových bezpečnostních předpisů při práci s vozidly.',
          type: 'info',
          date: '2024-01-14',
          author: 'Bezpečnostní oddělení',
          isRead: true
        },
        {
          id: '3',
          title: 'Úspěšné dokončení projektu',
          content: 'Děkujeme všem za úspěšné dokončení projektu modernizace vozového parku.',
          type: 'success',
          date: '2024-01-13',
          author: 'Vedení',
          isRead: true
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading management messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMessageBadgeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'warning':
        return 'Upozornění';
      case 'urgent':
        return 'Naléhavé';
      case 'success':
        return 'Úspěch';
      default:
        return 'Informace';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Načítání zpráv od vedení...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Zprávy od vedení
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Žádné nové zprávy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg border ${
                  message.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(message.type)}
                    <h3 className={`font-semibold ${message.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {message.title}
                    </h3>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getMessageBadgeColor(message.type)}`}
                  >
                    {getMessageTypeText(message.type)}
                  </Badge>
                </div>
                
                <p className={`text-sm mb-2 ${message.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                  {message.content}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Od: {message.author}</span>
                  <span>{formatDate(message.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
