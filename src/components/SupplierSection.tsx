import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const SupplierSection = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // Показываем секцию только для поставщиков
  if (userRole !== 'supplier') return null;

  return (
    <section id="supplier-section" className="py-16 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Icon name="Package" size={32} className="text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать, поставщик!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Начните продавать свои товары тысячам покупателей. 
            Разместите каталог, получайте заказы и развивайте бизнес.
          </p>
        </div>

        {/* Быстрые действия */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Добавить товар */}
          <Link
            to="/add-product"
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <Icon name="Plus" size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Добавить товар
            </h3>
            <p className="text-gray-600 mb-4">
              Разместите ваши товары и услуги в каталоге
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              Начать размещение
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </div>
          </Link>

          {/* Мои товары */}
          <Link
            to="/supplier-products"
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <Icon name="Package" size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Мои товары
            </h3>
            <p className="text-gray-600 mb-4">
              Управляйте каталогом и отслеживайте продажи
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              Открыть каталог
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </div>
          </Link>

          {/* Заказы */}
          <Link
            to="/orders"
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
              <Icon name="ShoppingBag" size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Заказы
            </h3>
            <p className="text-gray-600 mb-4">
              Просматривайте и обрабатывайте заказы
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              Посмотреть заказы
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </div>
          </Link>
        </div>

        {/* Статистика и возможности */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Ваши возможности как поставщика
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Рост продаж</h4>
              <p className="text-sm text-gray-600">Доступ к тысячам потенциальных клиентов</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={24} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Безопасность</h4>
              <p className="text-sm text-gray-600">Защищенные платежи и гарантии сделок</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="BarChart3" size={24} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Аналитика</h4>
              <p className="text-sm text-gray-600">Подробная статистика по продажам</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={24} className="text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Поддержка</h4>
              <p className="text-sm text-gray-600">Персональный менеджер и техподдержка</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplierSection;