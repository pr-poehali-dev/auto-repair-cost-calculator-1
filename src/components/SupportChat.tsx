import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  isTyping?: boolean;
}

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChat = ({ isOpen, onClose }: SupportChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Здравствуйте! Меня зовут Анна, я помогу вам с любыми вопросами. Чем могу помочь?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Фокус на инпуте при открытии
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Симуляция ответа поддержки
  const simulateSupportResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        'Спасибо за ваш вопрос! Я изучаю информацию и отвечу через минуту.',
        'Понятно! Сейчас проверю эту информацию в нашей базе данных.',
        'Отличный вопрос! Позвольте мне найти для вас подробную информацию.',
        'Я передам ваш запрос специалисту. Он ответит в течение 5 минут.',
        'Вижу вашу проблему. Давайте разберем ее пошагово.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const supportMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(msg => !msg.isTyping).concat([supportMessage]));
      setIsTyping(false);
      
      if (isMinimized) {
        setHasUnread(true);
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Добавляем индикатор печатания
    const typingMessage: Message = {
      id: 'typing',
      text: 'Анна печатает...',
      sender: 'support',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    simulateSupportResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setHasUnread(false);
    }
  };

  const quickActions = [
    { text: 'Вопрос по заказу', icon: 'ShoppingBag' },
    { text: 'Проблема с оплатой', icon: 'CreditCard' },
    { text: 'Информация о доставке', icon: 'Truck' },
    { text: 'Техническая поддержка', icon: 'Settings' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 sm:w-96">
      <Card className="shadow-2xl border-2 border-primary/20">
        <CardHeader 
          className="bg-gradient-to-r from-primary to-primary/80 text-white cursor-pointer rounded-t-lg"
          onClick={toggleMinimize}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="MessageCircle" size={16} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Поддержка</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">Анна онлайн</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnread && (
                <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                  Новое
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
                onClick={toggleMinimize}
              >
                <Icon name={isMinimized ? "ChevronUp" : "ChevronDown"} size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
                onClick={onClose}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Сообщения */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.sender === 'support' && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-semibold">А</span>
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : message.isTyping
                          ? 'bg-gray-200 text-gray-600 animate-pulse'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые действия */}
            <div className="p-3 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Популярные вопросы:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 justify-start"
                    onClick={() => setInputMessage(action.text)}
                  >
                    <Icon name={action.icon as any} size={12} className="mr-1" />
                    <span className="truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Поле ввода */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите ваш вопрос..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                  className="px-3"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Обычно отвечаем в течение минуты
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SupportChat;