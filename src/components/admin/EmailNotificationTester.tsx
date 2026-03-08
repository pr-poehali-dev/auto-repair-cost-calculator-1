import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface EmailStats {
  total_trial_suppliers: number;
  notified_suppliers: number;
  expiring_soon: number;
}

export default function EmailNotificationTester() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
        setLastResult(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastResult(data);
        // Обновляем статистику после отправки
        await fetchStats();
      } else {
        console.error('Failed to send notifications');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Система Email-уведомлений
          </h3>
          <p className="text-gray-600 text-sm">
            Управление уведомлениями о пробном периоде
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
            Обновить
          </button>
          <button
            onClick={sendNotifications}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="Send" size={16} />
            Отправить уведомления
          </button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Всего в пробном периоде</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_trial_suppliers}</p>
              </div>
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Уведомлены</p>
                <p className="text-2xl font-bold text-green-900">{stats.notified_suppliers}</p>
              </div>
              <Icon name="Mail" size={24} className="text-green-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Скоро истекает</p>
                <p className="text-2xl font-bold text-orange-900">{stats.expiring_soon}</p>
              </div>
              <Icon name="Clock" size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Информация о системе */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Как работает система:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <Icon name="Check" size={16} className="text-green-500 mr-2" />
            Email-уведомления отправляются за 7 дней до окончания пробного периода
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={16} className="text-green-500 mr-2" />
            Каждому поставщику отправляется только одно уведомление
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={16} className="text-green-500 mr-2" />
            HTML и текстовая версии письма для максимальной совместимости
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={16} className="text-green-500 mr-2" />
            Автоматическое отслеживание статуса отправки
          </li>
        </ul>
      </div>

      {/* Последний результат */}
      {lastResult && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Последний результат:</h4>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Загрузка */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={32} className="text-gray-400 animate-spin" />
        </div>
      )}
    </div>
  );
}