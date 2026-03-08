import React from 'react';
import Icon from '@/components/ui/icon';
import TrialExpirationNotice from '@/components/notifications/TrialExpirationNotice';
import EmailNotificationTester from '@/components/admin/EmailNotificationTester';
import SchedulerManager from '@/components/admin/SchedulerManager';
import { useNavigate } from 'react-router-dom';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Активные товары',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'Package'
    },
    {
      title: 'Просмотры за месяц',
      value: '1,245',
      change: '+12%',
      changeType: 'positive',
      icon: 'Eye'
    },
    {
      title: 'Заявки',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: 'Mail'
    },
    {
      title: 'Рейтинг',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: 'Star'
    }
  ];

  const recentActivity = [
    {
      type: 'view',
      title: 'Новый просмотр товара',
      description: 'Гидравлический подъемник H-2000',
      time: '2 минуты назад',
      icon: 'Eye'
    },
    {
      type: 'inquiry',
      title: 'Новая заявка',
      description: 'Запрос цены на электрическую тележку',
      time: '1 час назад',
      icon: 'Mail'
    },
    {
      type: 'product',
      title: 'Товар обновлен',
      description: 'Конвейерная лента KL-500',
      time: '3 часа назад',
      icon: 'Package'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Уведомление о пробном периоде */}
      <TrialExpirationNotice 
        onUpgrade={() => navigate('/pricing')}
        onDismiss={() => {}}
      />

      {/* Заголовок */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Панель поставщика
            </h1>
            <p className="text-gray-600 mt-1">
              Управляйте своими товарами и отслеживайте статистику
            </p>
          </div>
          <button
            onClick={() => navigate('/supplier/products/add')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <Icon name="Plus" size={16} />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    за неделю
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name={stat.icon as any} size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Быстрые действия и активность */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Быстрые действия */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Быстрые действия
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/supplier/products')}
              className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="Package" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Мои товары</p>
                <p className="text-sm text-gray-500">Управление каталогом</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/supplier/orders')}
              className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="ShoppingCart" size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Заказы</p>
                <p className="text-sm text-gray-500">Обработка заявок</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/supplier/analytics')}
              className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="BarChart3" size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Аналитика</p>
                <p className="text-sm text-gray-500">Отчеты и статистика</p>
              </div>
            </button>
          </div>
        </div>

        {/* Последняя активность */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Последняя активность
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <Icon name={activity.icon as any} size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-center text-green-600 hover:text-green-700 font-medium text-sm">
            Посмотреть все
          </button>
        </div>
      </div>

      {/* Email-уведомления (только для демонстрации) */}
      <EmailNotificationTester />

      {/* Планировщик уведомлений */}
      <SchedulerManager />

      {/* График или дополнительная информация */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Статистика просмотров
          </h3>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
            <option>Последние 3 месяца</option>
          </select>
        </div>
        
        {/* Простой график-заглушка */}
        <div className="h-48 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="TrendingUp" size={48} className="text-green-600 mx-auto mb-2" />
            <p className="text-gray-600">График статистики</p>
            <p className="text-sm text-gray-500">Будет реализован позже</p>
          </div>
        </div>
      </div>
    </div>
  );
}