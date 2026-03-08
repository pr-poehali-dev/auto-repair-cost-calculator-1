import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface TrialExpirationNoticeProps {
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export default function TrialExpirationNotice({ onUpgrade, onDismiss }: TrialExpirationNoticeProps) {
  const { user } = useAuth();
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'supplier') return;

    // Симуляция расчета дней до окончания пробного периода
    // В реальном приложении это будет приходить от API
    const registrationDate = new Date(user.created_at || Date.now());
    const trialEndDate = new Date(registrationDate);
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);
    
    const today = new Date();
    const timeDiff = trialEndDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    setDaysLeft(daysDiff);
    
    // Показываем уведомление если осталось 30, 14, 7 или 3 дня
    if ([30, 14, 7, 3, 1].includes(daysDiff) || daysDiff <= 0) {
      setShowNotice(true);
    }
  }, [user]);

  const handleDismiss = () => {
    setShowNotice(false);
    onDismiss?.();
  };

  const getNoticeConfig = () => {
    if (daysLeft <= 0) {
      return {
        type: 'expired',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        icon: 'AlertCircle',
        title: 'Пробный период истек',
        message: 'Ваш бесплатный период закончился. Обновите тариф, чтобы продолжить использование всех функций.'
      };
    } else if (daysLeft <= 3) {
      return {
        type: 'critical',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-900',
        textColor: 'text-orange-700',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        icon: 'Clock',
        title: `Осталось ${daysLeft} ${daysLeft === 1 ? 'день' : 'дня'}`,
        message: 'Ваш пробный период скоро закончится. Обновите тариф сейчас, чтобы избежать перерыва в работе.'
      };
    } else if (daysLeft <= 7) {
      return {
        type: 'warning',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-700',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        icon: 'Calendar',
        title: `Осталось ${daysLeft} дней`,
        message: 'Ваш пробный период скоро закончится. Самое время выбрать подходящий тариф.'
      };
    } else {
      return {
        type: 'info',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-700',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        icon: 'Info',
        title: `Осталось ${daysLeft} дней пробного периода`,
        message: 'Изучайте возможности платформы и готовьтесь к выбору тарифа.'
      };
    }
  };

  if (!showNotice || !user || user.user_type !== 'supplier') return null;

  const config = getNoticeConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 mb-6 relative`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon name="X" size={16} />
      </button>

      <div className="flex items-start pr-8">
        <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center mr-4 flex-shrink-0 border ${config.borderColor}`}>
          <Icon name={config.icon as any} size={20} className={config.iconColor} />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold ${config.titleColor} mb-1`}>
            {config.title}
          </h4>
          <p className={`text-sm ${config.textColor} mb-3`}>
            {config.message}
          </p>

          {daysLeft <= 7 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onUpgrade}
                className={`px-4 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors text-sm`}
              >
                {daysLeft <= 0 ? 'Выбрать тариф' : 'Обновить тариф'}
              </button>
              
              {daysLeft > 0 && (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Напомнить позже
                </button>
              )}
            </div>
          )}

          {daysLeft > 7 && (
            <button
              onClick={onUpgrade}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Посмотреть тарифы →
            </button>
          )}
        </div>
      </div>

      {/* Прогресс-бар для пробного периода */}
      {daysLeft > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Пробный период</span>
            <span className="text-xs text-gray-600">{Math.max(0, daysLeft)} из 90 дней</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                daysLeft <= 3 ? 'bg-red-500' : 
                daysLeft <= 7 ? 'bg-orange-500' : 
                daysLeft <= 14 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.max(5, (90 - daysLeft) / 90 * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}