import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MessageSquare, AlertCircle, Info, CheckCircle, Users, Camera, X, ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { AddMessageDialog } from './AddMessageDialog';
import { MessageActions } from './MessageActions';
import { apiService } from '../services/api';

interface ManagementMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  author: string;
  isRead: boolean;
}

interface DriverMessage {
  id: string;
  title: string;
  content: string;
  type: 'question' | 'issue' | 'suggestion' | 'feedback';
  date: string;
  author: string;
  isRead: boolean;
  photos?: string[]; // Array of photo URLs or base64 strings
}

export function ManagementMessages() {
  const [activeTab, setActiveTab] = useState<'management' | 'drivers'>('management');
  const [managementMessages, setManagementMessages] = useState<ManagementMessage[]>([]);
  const [driverMessages, setDriverMessages] = useState<DriverMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Načtení zpráv od vedení z API
      const managementResponse = await apiService.getMessages();
      setManagementMessages(managementResponse.messages);

      // Mock data pro zprávy od řidičů (zatím ponecháváme mock)
      const mockDriverMessages: DriverMessage[] = [
        {
          id: '1',
          title: 'Problém s vozidlem',
          content: 'Vozidlo SPZ ABC-1234 má problém s brzdami. Prosím o kontrolu.',
          type: 'issue',
          date: '2024-01-15',
          author: 'Jan Novák',
          isRead: false,
          photos: [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvdG8gYnJ6ZGE8L3RleHQ+PC9zdmc+',
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvdG8gdm96aWRsYTwvdGV4dD48L3N2Zz4='
          ]
        },
        {
          id: '2',
          title: 'Návrh na zlepšení',
          content: 'Navrhuji přidat GPS navigaci do všech vozidel pro lepší orientaci.',
          type: 'suggestion',
          date: '2024-01-14',
          author: 'Marie Svobodová',
          isRead: true
        },
        {
          id: '3',
          title: 'Dotaz na směny',
          content: 'Můžu si prosím vyměnit směnu s kolegou na příští týden?',
          type: 'question',
          date: '2024-01-13',
          author: 'Petr Dvořák',
          isRead: true
        },
        {
          id: '4',
          title: 'Pozitivní zpětná vazba',
          content: 'Nový systém evidence hodin funguje výborně, děkuji za zlepšení!',
          type: 'feedback',
          date: '2024-01-12',
          author: 'Anna Kratochvílová',
          isRead: true,
          photos: [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvdG8gZGVtbzwvdGV4dD48L3N2Zz4='
          ]
        }
      ];

      setDriverMessages(mockDriverMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback na mock data při chybě
      const mockManagementMessages: ManagementMessage[] = [
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
      setManagementMessages(mockManagementMessages);
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
      case 'issue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'question':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'suggestion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
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
      case 'issue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'question':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suggestion':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'feedback':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
      case 'issue':
        return 'Problém';
      case 'question':
        return 'Dotaz';
      case 'suggestion':
        return 'Návrh';
      case 'feedback':
        return 'Zpětná vazba';
      default:
        return 'Informace';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  // Photo handling functions
  const handlePhotoClick = (photos: string[], index: number) => {
    setSelectedPhotos(photos);
    setCurrentPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };

  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : selectedPhotos.length - 1);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => prev < selectedPhotos.length - 1 ? prev + 1 : 0);
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const isMessageExpanded = (messageId: string) => {
    return expandedMessages.has(messageId);
  };

  const shouldTruncateText = (text: string) => {
    return text.length > 150 || text.split('\n').length > 3;
  };


  const renderMessage = (message: ManagementMessage | DriverMessage) => {
    const driverMessage = message as DriverMessage;
    const isManagementMessage = activeTab === 'management';
    
    return (
      <div 
        key={message.id} 
        className={`p-4 rounded-lg border w-full ${
          message.isRead 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-blue-50 border-blue-200'
        }`}
        style={{ 
          maxWidth: '100%',
          overflow: 'hidden',
          wordWrap: 'break-word',
          overflowWrap: 'anywhere'
        }}
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {getMessageIcon(message.type)}
            <h3 className={`font-semibold break-words overflow-wrap-anywhere flex-1 min-w-0 ${message.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {message.title}
            </h3>
            {!message.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getMessageBadgeColor(message.type)}`}
            >
              {getMessageTypeText(message.type)}
            </Badge>
            {/* Akce pro administrátory - pouze pro zprávy od vedení */}
            {isManagementMessage && (
              <MessageActions
                message={message as ManagementMessage}
                onMessageUpdated={loadMessages}
                onMessageDeleted={loadMessages}
              />
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <p 
            className={`text-sm text-left break-words overflow-wrap-anywhere ${message.isRead ? 'text-gray-600' : 'text-gray-700'}`}
            style={{
              ...((!isMessageExpanded(message.id) && shouldTruncateText(message.content)) && {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              })
            }}
          >
            {message.content}
          </p>
          
          {/* Tlačítko pro rozbalení/sbalení */}
          {shouldTruncateText(message.content) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMessageExpansion(message.id)}
              className="mt-1 h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent"
            >
              <MoreHorizontal className="h-3 w-3 mr-1" />
              {isMessageExpanded(message.id) ? 'Zobrazit méně' : 'Zobrazit více'}
            </Button>
          )}
        </div>

        {/* Photo thumbnails */}
        {driverMessage.photos && driverMessage.photos.length > 0 && (
          <div className="mb-3">
            <div className="flex gap-2 flex-wrap">
              {driverMessage.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer group"
                  onClick={() => handlePhotoClick(driverMessage.photos!, index)}
                >
                  <img
                    src={photo}
                    alt={`Fotografie ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border border-gray-300 hover:border-blue-400 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {driverMessage.photos.length} {driverMessage.photos.length === 1 ? 'fotografie' : 'fotografií'} - klikněte pro zobrazení
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Od: {message.author}</span>
          <span>{formatDate(message.date)}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full mx-auto" style={{ width: '32rem', maxWidth: '32rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Načítání zpráv...
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

  const currentMessages = activeTab === 'management' ? managementMessages : driverMessages;
  const displayedMessages = currentMessages.slice(0, 3); // Zobraz pouze první 3 zprávy
  const unreadCount = currentMessages.filter(msg => !msg.isRead).length;
  const hasMoreMessages = currentMessages.length > 3;

  return (
    <>
      <Card className="w-full mx-auto" style={{ width: '32rem', maxWidth: '32rem' }}>
        <CardHeader className="pb-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Button
              variant={activeTab === 'management' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('management')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Zprávy od vedení
              {activeTab === 'management' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'drivers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('drivers')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Zprávy od řidičů
              {activeTab === 'drivers' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Tlačítko pro přidávání zpráv - pouze pro administrátory a pouze na záložce zpráv od vedení */}
            {activeTab === 'management' && (
              <AddMessageDialog onMessageAdded={loadMessages} />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {displayedMessages.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Žádné nové zprávy</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedMessages.map((message) => renderMessage(message))}
              </div>
              
              {/* Tlačítko pro zobrazení celé historie */}
              {hasMoreMessages && (
                <div className="flex justify-center mt-4 pt-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistoryDialogOpen(true)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>Zobrazit všechny ({currentMessages.length})</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* History dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {activeTab === 'management' ? 'Historie zpráv od vedení' : 'Historie zpráv od řidičů'}
              </DialogTitle>
            </DialogHeader>
            
            <div 
              className="flex-1 px-6 py-4 overflow-y-auto overflow-x-hidden"
              style={{ 
                maxHeight: 'calc(85vh - 80px)',
                minHeight: '300px',
                wordWrap: 'break-word',
                overflowWrap: 'anywhere'
              }}
            >
              <div className="space-y-4 max-w-full">
                {currentMessages.map((message) => renderMessage(message))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Fotografie ({currentPhotoIndex + 1} z {selectedPhotos.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative p-6">
            {selectedPhotos.length > 0 && (
              <>
                <img
                  src={selectedPhotos[currentPhotoIndex]}
                  alt={`Fotografie ${currentPhotoIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                />
                
                {selectedPhotos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      onClick={handlePreviousPhoto}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      onClick={handleNextPhoto}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
