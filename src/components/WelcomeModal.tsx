import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface WelcomeModalProps {
  onOpen?: () => void;
  onClose?: () => void;
}

const WelcomeModal = ({ onOpen, onClose }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Временно очищаем localStorage для тестирования
    localStorage.removeItem('welcomeModalSeen');
    localStorage.removeItem('userRole');
    
    const timer = setTimeout(() => {
      setIsOpen(true);
      onOpen?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleRoleSelect = (role: 'supplier' | 'buyer') => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
    handleClose();
    
    // Прокрутка к соответствующей секции
    const targetSection = role === 'supplier' ? 'supplier-section' : 'search-section';
    const element = document.getElementById(targetSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 relative shadow-2xl transform transition-all duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-2 hover:bg-gray-100 rounded-full"
        >
          <Icon name="X" size={20} />
        </button>
        
        {/* Заголовок */}
        <div className="text-center p-8 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Users" size={36} className="text-teal-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в Business Market!
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Современная B2B площадка для прямых поставок товаров и услуг
          </p>
          <p className="text-gray-500 text-base">
            Выберите вашу роль для персонализированного опыта
          </p>
        </div>

        {/* Выбор роли */}
        <div className="p-8 grid md:grid-cols-2 gap-6">
          {/* Поставщик */}
          <button
            onClick={() => handleRoleSelect('supplier')}
            className="group p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 text-left hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="Package" size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 ml-4">
                Я поставщик
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-base">
              Предлагаю товары и услуги для бизнеса
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="TrendingUp" size={16} className="mr-3 text-green-500" />
                Размещение товаров и услуг
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="Users" size={16} className="mr-3 text-green-500" />
                Поиск и привлечение клиентов
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="BarChart3" size={16} className="mr-3 text-green-500" />
                Управление заказами и продажами
              </div>
            </div>
          </button>

          {/* Покупатель */}
          <button
            onClick={() => handleRoleSelect('buyer')}
            className="group p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 text-left hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="ShoppingCart" size={28} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 ml-4">
                Я покупатель
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-base">
              Ищу товары и услуги для своего бизнеса
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="Search" size={16} className="mr-3 text-green-500" />
                Поиск нужных товаров
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="MessageCircle" size={16} className="mr-3 text-green-500" />
                Прямая связь с поставщиками
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Icon name="Star" size={16} className="mr-3 text-green-500" />
                Выгодные предложения
              </div>
            </div>
          </button>
        </div>

        {/* Подвал */}
        <div className="px-8 pb-6 pt-2">
          <p className="text-center text-sm text-gray-500">
            💡 Вы сможете изменить роль в любое время в настройках профиля
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;