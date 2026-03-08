import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SupportChat from './SupportChat';

const SupportChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setHasNewMessages(false);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {/* Плавающая кнопка чата */}
      {!isChatOpen && (
        <div className="fixed bottom-4 right-4 z-[9998]">
          <Button
            onClick={handleOpenChat}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl relative group animate-bounce"
            size="lg"
          >
            <Icon name="MessageCircle" size={24} className="text-white" />
            {hasNewMessages && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-pulse">
                !
              </Badge>
            )}
            
            {/* Подсказка */}
            <div className="absolute right-full mr-3 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Нужна помощь? Напишите нам!
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </Button>
        </div>
      )}

      {/* Компонент чата */}
      <SupportChat isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
};

export default SupportChatButton;