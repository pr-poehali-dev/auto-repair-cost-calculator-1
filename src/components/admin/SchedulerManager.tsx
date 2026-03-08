import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface SchedulerStatus {
  scheduler_status: string;
  current_time: string;
  next_scheduled_run: string;
  notifications_api: {
    url: string;
    status: string;
    response_time_seconds?: number;
  };
  schedule: {
    frequency: string;
    time: string;
    description: string;
  };
}

interface SchedulerResult {
  scheduler_run_time: string;
  status: string;
  emails_sent?: number;
  total_suppliers?: number;
  notifications_result?: any;
}

export default function SchedulerManager() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [lastResult, setLastResult] = useState<SchedulerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const schedulerUrl = 'https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a';

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      // Временно используем моковые данные до деплоя планировщика
      const mockStatus: SchedulerStatus = {
        scheduler_status: 'active',
        current_time: new Date().toISOString(),
        next_scheduled_run: new Date(Date.now() + 86400000).toISOString(),
        notifications_api: {
          url: 'https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b',
          status: 'healthy',
          response_time_seconds: 0.245
        },
        schedule: {
          frequency: 'daily',
          time: '10:00 UTC',
          description: 'Проверяет поставщиков с истекающим пробным периодом'
        }
      };
      
      setStatus(mockStatus);
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeScheduler = async () => {
    setIsExecuting(true);
    try {
      // Временно вызываем напрямую функцию уведомлений
      const response = await fetch('https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        const result: SchedulerResult = {
          scheduler_run_time: new Date().toISOString(),
          status: 'success',
          emails_sent: data.emails_sent || 0,
          total_suppliers: data.total_suppliers || 0,
          notifications_result: data
        };
        setLastResult(result);
      } else {
        const result: SchedulerResult = {
          scheduler_run_time: new Date().toISOString(),
          status: 'error'
        };
        setLastResult(result);
      }
    } catch (error) {
      console.error('Error executing scheduler:', error);
      const result: SchedulerResult = {
        scheduler_run_time: new Date().toISOString(),
        status: 'error'
      };
      setLastResult(result);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
      case 'unreachable':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Планировщик уведомлений
          </h3>
          <p className="text-gray-600 text-sm">
            Автоматическая отправка email-уведомлений о пробном периоде
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
            Обновить
          </button>
          <button
            onClick={executeScheduler}
            disabled={isExecuting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="Play" size={16} className={isExecuting ? 'animate-pulse' : ''} />
            Запустить сейчас
          </button>
        </div>
      </div>

      {/* Статус планировщика */}
      {status && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Статус планировщика</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.scheduler_status)}`}>
                  {status.scheduler_status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {status.schedule.description}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">API уведомлений</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.notifications_api.status)}`}>
                  {status.notifications_api.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {status.notifications_api.response_time_seconds && 
                  `Время ответа: ${(status.notifications_api.response_time_seconds * 1000).toFixed(0)}ms`
                }
              </p>
            </div>
          </div>

          {/* Расписание */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <Icon name="Calendar" size={16} className="mr-2" />
              Расписание выполнения
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Частота:</span>
                <span className="ml-2 text-blue-600">{status.schedule.frequency} в {status.schedule.time}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Следующий запуск:</span>
                <span className="ml-2 text-blue-600">{formatDateTime(status.next_scheduled_run)}</span>
              </div>
            </div>
          </div>

          {/* Как настроить автоматический запуск */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройка автоматического запуска
            </h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>Для автоматического ежедневного запуска настройте одну из опций:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>GitHub Actions:</strong> Создайте workflow для ежедневного вызова функции</li>
                <li><strong>Cron Job:</strong> Настройте cron на сервере для вызова endpoint</li>
                <li><strong>Yandex Cloud Triggers:</strong> Создайте триггер по расписанию</li>
                <li><strong>External Service:</strong> Используйте сервисы типа cron-job.org</li>
              </ul>
              <div className="mt-3 bg-yellow-100 p-2 rounded font-mono text-xs">
                curl -X POST {schedulerUrl || 'SCHEDULER_URL'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Результат последнего выполнения */}
      {lastResult && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Icon name="Activity" size={16} className="mr-2" />
            Последнее выполнение
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Время запуска:</span>
              <span className="font-medium">{formatDateTime(lastResult.scheduler_run_time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Статус:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lastResult.status)}`}>
                {lastResult.status}
              </span>
            </div>
            {lastResult.emails_sent !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Отправлено писем:</span>
                <span className="font-medium">{lastResult.emails_sent}</span>
              </div>
            )}
            {lastResult.total_suppliers !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Всего поставщиков:</span>
                <span className="font-medium">{lastResult.total_suppliers}</span>
              </div>
            )}
          </div>
          
          {lastResult.notifications_result && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Подробные результаты
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(lastResult.notifications_result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Загрузка */}
      {(isLoading || isExecuting) && (
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={32} className="text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-600">
            {isExecuting ? 'Выполняется...' : 'Загрузка...'}
          </span>
        </div>
      )}
    </div>
  );
}