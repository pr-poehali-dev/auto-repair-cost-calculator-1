import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

// Импорт созданных компонентов
import PromotionStatsCard from './premium-promotion/PromotionStatsCard';
import UpgradeRecommendationCard from './premium-promotion/UpgradeRecommendationCard';
import PromotionCard from './premium-promotion/PromotionCard';
import PerformanceTab from './premium-promotion/PerformanceTab';
import UpgradeTab from './premium-promotion/UpgradeTab';
import { PremiumPromotion, TierBenefits } from './premium-promotion/types';

interface PremiumPromotionSystemProps {
  currentTier: 'starter' | 'basic' | 'professional' | 'enterprise';
  className?: string;
}

export default function PremiumPromotionSystem({ 
  currentTier = 'basic',
  className = "" 
}: PremiumPromotionSystemProps) {
  const [activeTab, setActiveTab] = useState('promotions');

  const tierBenefits: Record<string, TierBenefits> = {
    starter: {
      name: 'Стартовый',
      color: 'bg-gray-100 text-gray-800',
      promotions: []
    },
    basic: {
      name: 'Базовый', 
      color: 'bg-blue-100 text-blue-800',
      promotions: ['priority-search', 'email-promotion']
    },
    professional: {
      name: 'Профессиональный',
      color: 'bg-purple-100 text-purple-800', 
      promotions: ['priority-search', 'email-promotion', 'banner-ads', 'category-highlight', 'brand-page']
    },
    enterprise: {
      name: 'Корпоративный',
      color: 'bg-gold-100 text-gold-800',
      promotions: ['priority-search', 'email-promotion', 'banner-ads', 'category-highlight', 'brand-page', 'homepage-feature', 'exclusive-deals', 'white-label']
    }
  };

  const premiumPromotions: PremiumPromotion[] = [
    {
      id: 'priority-search',
      name: 'Приоритет в поиске',
      description: 'Ваши товары показываются первыми в результатах поиска',
      tier: 'basic',
      type: 'priority',
      price: 0,
      features: [
        'Первые 3 позиции в поиске',
        'Выделение цветом',
        'Метка "Рекомендуем"',
        'Автоматическая активация'
      ],
      benefits: [
        '+300% кликов',
        '+150% продаж', 
        'Больше узнаваемости'
      ],
      metrics: {
        impressions: 15420,
        clicks: 2380,
        conversions: 187,
        roi: 340
      },
      active: true
    },
    {
      id: 'email-promotion',
      name: 'Email-рассылки клиентам',
      description: 'Ваши товары в персональных рекомендациях покупателям',
      tier: 'basic',
      type: 'exclusive',
      price: 0,
      features: [
        'Включение в еженедельные рассылки',
        'Персональные рекомендации',
        'Сегментация по интересам',
        'A/B тестирование писем'
      ],
      benefits: [
        '+80% повторных покупок',
        'Увеличение среднего чека',
        'Лояльность клиентов'
      ],
      metrics: {
        impressions: 45600,
        clicks: 1230,
        conversions: 98,
        roi: 280
      },
      active: true
    },
    {
      id: 'banner-ads',
      name: 'Баннерная реклама',
      description: 'Ваши товары в премиум-местах на сайте',
      tier: 'professional',
      type: 'exclusive',
      price: 2990,
      features: [
        'Баннеры на главной странице',
        'Сайдбар в каталоге',
        'Межстраничные баннеры',
        'Мобильная реклама'
      ],
      benefits: [
        'Максимальный охват',
        '+500% показов',
        'Брендинг компании'
      ],
      metrics: {
        impressions: 234000,
        clicks: 8900,
        conversions: 567,
        roi: 450
      },
      active: false
    },
    {
      id: 'category-highlight',
      name: 'Выделение в категориях',
      description: 'Специальное оформление ваших товаров в каталоге',
      tier: 'professional',
      type: 'branding',
      price: 0,
      features: [
        'Золотая рамка товаров',
        'Метка "Premium партнер"',
        'Увеличенные превью',
        'Приоритетная загрузка'
      ],
      benefits: [
        'Премиум восприятие',
        '+40% CTR',
        'Выделение среди конкурентов'
      ],
      metrics: {
        impressions: 89000,
        clicks: 3560,
        conversions: 245,
        roi: 320
      },
      active: true
    },
    {
      id: 'brand-page',
      name: 'Персональная страница бренда',
      description: 'Индивидуальная страница с вашими товарами и брендингом',
      tier: 'professional',
      type: 'branding',
      price: 0,
      features: [
        'Собственный URL /brand/ваш-бренд',
        'Индивидуальный дизайн',
        'Описание компании',
        'Контактная информация',
        'Каталог всех товаров'
      ],
      benefits: [
        'Профессиональный имидж',
        'SEO-продвижение бренда',
        'Прямые ссылки на товары'
      ],
      metrics: {
        impressions: 12400,
        clicks: 890,
        conversions: 67,
        roi: 180
      },
      active: true
    },
    {
      id: 'homepage-feature',
      name: 'Размещение на главной',
      description: 'Ваши товары в блоке "Рекомендуем" на главной странице',
      tier: 'enterprise',
      type: 'exclusive',
      price: 9990,
      features: [
        'Слайдер на главной странице',
        'Блок "Товар дня"',
        'Новинки от партнера',
        'Ротация каждые 2 часа'
      ],
      benefits: [
        'Максимальная видимость',
        '+1000% трафика',
        'Имидж топ-партнера'
      ],
      metrics: {
        impressions: 567000,
        clicks: 23400,
        conversions: 1890,
        roi: 650
      },
      active: false
    },
    {
      id: 'exclusive-deals',
      name: 'Эксклюзивные акции',
      description: 'Специальные предложения только для ваших товаров',
      tier: 'enterprise',
      type: 'exclusive',
      price: 0,
      features: [
        'Персональные промокоды',
        'Флэш-распродажи',
        'VIP-предзаказы',
        'Эксклюзивная рассылка'
      ],
      benefits: [
        'Уникальные предложения',
        '+200% конверсии',
        'Лояльная аудитория'
      ],
      metrics: {
        impressions: 78000,
        clicks: 4200,
        conversions: 890,
        roi: 780
      },
      active: true
    }
  ];

  const availablePromotions = premiumPromotions.filter(promo => 
    tierBenefits[currentTier].promotions.includes(promo.id)
  );

  const lockedPromotions = premiumPromotions.filter(promo => 
    !tierBenefits[currentTier].promotions.includes(promo.id)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'priority': return 'TrendingUp';
      case 'exclusive': return 'Star';
      case 'branding': return 'Award';
      case 'analytics': return 'BarChart3';
      default: return 'Zap';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'priority': return 'bg-blue-100 text-blue-800';
      case 'exclusive': return 'bg-purple-100 text-purple-800';
      case 'branding': return 'bg-green-100 text-green-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierUpgradePromotions = () => {
    const nextTiers: Record<string, string> = {
      starter: 'basic',
      basic: 'professional', 
      professional: 'enterprise',
      enterprise: 'enterprise'
    };
    
    const nextTier = nextTiers[currentTier];
    if (nextTier === currentTier) return [];
    
    return premiumPromotions.filter(promo => 
      tierBenefits[nextTier].promotions.includes(promo.id) &&
      !tierBenefits[currentTier].promotions.includes(promo.id)
    );
  };

  const upgradePromotions = getTierUpgradePromotions();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Премиум продвижение</h2>
          <p className="text-gray-600">Эксклюзивные возможности для вашего тарифа</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={tierBenefits[currentTier].color}>
            {tierBenefits[currentTier].name} тариф
          </Badge>
          <Button>
            <Icon name="Crown" size={16} className="mr-2" />
            Повысить тариф
          </Button>
        </div>
      </div>

      {/* Статистика эффективности */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PromotionStatsCard
          title="Общие показы"
          value={availablePromotions.reduce((sum, p) => sum + (p.metrics.impressions || 0), 0).toLocaleString()}
          icon="Eye"
          color="text-blue-600"
        />
        <PromotionStatsCard
          title="Клики"
          value={availablePromotions.reduce((sum, p) => sum + (p.metrics.clicks || 0), 0).toLocaleString()}
          icon="MousePointer"
          color="text-green-600"
        />
        <PromotionStatsCard
          title="Конверсии"
          value={availablePromotions.reduce((sum, p) => sum + (p.metrics.conversions || 0), 0).toLocaleString()}
          icon="ShoppingCart"
          color="text-purple-600"
        />
        <PromotionStatsCard
          title="Средний ROI"
          value={`${Math.round(
            availablePromotions.reduce((sum, p) => sum + (p.metrics.roi || 0), 0) / 
            availablePromotions.length
          )}%`}
          icon="TrendingUp"
          color="text-orange-600"
        />
      </div>

      {/* Рекомендация по апгрейду */}
      <UpgradeRecommendationCard upgradePromotions={upgradePromotions} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="promotions">Доступные инструменты</TabsTrigger>
          <TabsTrigger value="performance">Эффективность</TabsTrigger>
          <TabsTrigger value="upgrade">Что получу при апгрейде</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4">
          {/* Доступные инструменты */}
          {availablePromotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" size={20} />
                  Активные инструменты продвижения
                </CardTitle>
                <CardDescription>
                  Инструменты, доступные на вашем тарифе "{tierBenefits[currentTier].name}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {availablePromotions.map((promotion) => (
                    <PromotionCard
                      key={promotion.id}
                      promotion={promotion}
                      isAvailable={true}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Заблокированные инструменты */}
          {lockedPromotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Lock" size={20} />
                  Доступно на более высоких тарифах
                </CardTitle>
                <CardDescription>
                  Эти инструменты станут доступны при повышении тарифа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {lockedPromotions.map((promotion) => (
                    <PromotionCard
                      key={promotion.id}
                      promotion={promotion}
                      isAvailable={false}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTab 
            availablePromotions={availablePromotions}
            getTypeColor={getTypeColor}
          />
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <UpgradeTab 
            upgradePromotions={upgradePromotions}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}