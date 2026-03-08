import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

// Импорт созданных компонентов
import QuickSettingsCard from './marketing-tools/QuickSettingsCard';
import MarketingToolCard from './marketing-tools/MarketingToolCard';
import TemplatesTab from './marketing-tools/TemplatesTab';
import InsightsTab from './marketing-tools/InsightsTab';
import { MarketingTool, PromoSettings } from './marketing-tools/types';

interface SupplierMarketingToolsProps {
  className?: string;
}

export default function SupplierMarketingTools({ className = "" }: SupplierMarketingToolsProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'templates' | 'insights'>('tools');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [promoSettings, setPromoSettings] = useState<PromoSettings>({
    autoDiscount: false,
    seasonalPromotions: false,
    lowStockAlerts: true,
    priceTracking: false
  });

  const marketingTools: MarketingTool[] = [
    {
      id: 'auto-email',
      name: 'Email-маркетинг',
      description: 'Автоматические рассылки покупателям и рекламные кампании',
      icon: 'Mail',
      category: 'communication',
      premium: false,
      features: [
        'Готовые шаблоны писем',
        'Сегментация покупателей',
        'A/B тестирование',
        'Статистика открытий и кликов'
      ],
      benefits: [
        '+40% повторных покупок',
        'Автоматизация коммуникаций',
        'Персонализированные предложения'
      ]
    },
    {
      id: 'seo-optimizer',
      name: 'SEO-оптимизация',
      description: 'Автоматическая оптимизация описаний товаров для поиска',
      icon: 'Search',
      category: 'content',
      premium: true,
      price: '490 ₽/мес',
      features: [
        'Анализ ключевых слов',
        'Оптимизация заголовков',
        'Мета-описания товаров',
        'Отчеты по позициям'
      ],
      benefits: [
        '+60% трафика из поиска',
        'Автоматическая оптимизация',
        'Отслеживание конкурентов'
      ]
    },
    {
      id: 'price-monitor',
      name: 'Мониторинг цен',
      description: 'Отслеживание цен конкурентов и автоматическая корректировка',
      icon: 'BarChart3',
      category: 'analytics',
      premium: true,
      price: '990 ₽/мес',
      features: [
        'Мониторинг 50+ площадок',
        'Автоматическое изменение цен',
        'Уведомления о изменениях',
        'Анализ конкурентов'
      ],
      benefits: [
        'Всегда конкурентные цены',
        'Защита от демпинга',
        '+25% прибыли'
      ]
    },
    {
      id: 'social-media',
      name: 'Социальные сети',
      description: 'Автоматическая публикация товаров в соцсетях',
      icon: 'Share2',
      category: 'communication',
      premium: false,
      features: [
        'Публикация в ВК, Телеграм',
        'Готовые посты с товарами',
        'Планировщик публикаций',
        'Статистика охватов'
      ],
      benefits: [
        '+30% узнаваемости бренда',
        'Автоматический контент',
        'Новые каналы продаж'
      ]
    },
    {
      id: 'review-manager',
      name: 'Управление отзывами',
      description: 'Получение и обработка отзывов покупателей',
      icon: 'MessageSquare',
      category: 'communication',
      premium: false,
      features: [
        'Автозапросы отзывов',
        'Шаблоны ответов',
        'Мониторинг репутации',
        'Анализ настроений'
      ],
      benefits: [
        '+80% больше отзывов',
        'Улучшение репутации',
        'Увеличение доверия'
      ]
    },
    {
      id: 'inventory-ai',
      name: 'ИИ для складских остатков',
      description: 'Прогнозирование спроса и оптимизация закупок',
      icon: 'Bot',
      category: 'automation',
      premium: true,
      price: '1490 ₽/мес',
      features: [
        'Прогноз спроса на 30 дней',
        'Рекомендации по закупкам',
        'Анализ сезонности',
        'Оптимизация остатков'
      ],
      benefits: [
        '-40% затрат на хранение',
        'Никогда не заканчивается товар',
        'Умные закупки'
      ]
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Маркетинговые инструменты</h2>
          <p className="text-gray-600">Автоматизируйте продвижение и увеличивайте продажи</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Icon name="HelpCircle" size={16} className="mr-2" />
            Обучение
          </Button>
          <Button>
            <Icon name="Zap" size={16} className="mr-2" />
            Получить Pro
          </Button>
        </div>
      </div>

      {/* Табы */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'tools' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tools')}
        >
          <Icon name="Wrench" size={16} className="mr-2" />
          Инструменты
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
        >
          <Icon name="FileText" size={16} className="mr-2" />
          Шаблоны
        </Button>
        <Button
          variant={activeTab === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('insights')}
        >
          <Icon name="TrendingUp" size={16} className="mr-2" />
          Аналитика
        </Button>
      </div>

      {/* Контент табов */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Быстрые настройки */}
          <QuickSettingsCard 
            promoSettings={promoSettings} 
            setPromoSettings={setPromoSettings} 
          />

          {/* Маркетинговые инструменты */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingTools.map((tool) => (
              <MarketingToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <TemplatesTab 
          emailTemplate={emailTemplate} 
          setEmailTemplate={setEmailTemplate} 
        />
      )}

      {activeTab === 'insights' && <InsightsTab />}
    </div>
  );
}