import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  features: string[];
  limits: {
    products: number;
    photos: number;
    promotions: number;
    analytics: boolean;
    support: string;
    commission: number;
  };
  benefits: string[];
}

interface SupplierPricingPlansProps {
  currentPlan?: string;
  className?: string;
}

export default function SupplierPricingPlans({ 
  currentPlan = 'basic',
  className = "" 
}: SupplierPricingPlansProps) {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Стартовый',
      price: 0,
      yearlyPrice: 0,
      description: 'Для начинающих поставщиков',
      features: [
        'До 10 товаров',
        'Базовые фото товаров',
        'Стандартная поддержка',
        'Комиссия 8%'
      ],
      limits: {
        products: 10,
        photos: 3,
        promotions: 0,
        analytics: false,
        support: 'email',
        commission: 8
      },
      benefits: [
        'Быстрый старт продаж',
        'Бесплатное размещение',
        'Обучающие материалы'
      ]
    },
    {
      id: 'basic',
      name: 'Базовый',
      price: 2900,
      yearlyPrice: 29000,
      description: 'Для растущего бизнеса',
      popular: true,
      features: [
        'До 100 товаров',
        'До 10 фото на товар',
        'Базовая аналитика',
        'Приоритетная поддержка',
        'Комиссия 6%',
        '1 бесплатная акция в месяц'
      ],
      limits: {
        products: 100,
        photos: 10,
        promotions: 1,
        analytics: true,
        support: 'chat',
        commission: 6
      },
      benefits: [
        'Снижение комиссии на 2%',
        'Инструменты продвижения',
        'Детальная аналитика',
        'Персональный менеджер'
      ]
    },
    {
      id: 'professional',
      name: 'Профессиональный',
      price: 5900,
      yearlyPrice: 59000,
      description: 'Для крупных поставщиков',
      features: [
        'До 1000 товаров',
        'Неограниченное количество фото',
        'Продвинутая аналитика',
        'Приоритетная поддержка',
        'Комиссия 4%',
        '5 акций в месяц',
        'API для интеграции',
        'Брендинг магазина'
      ],
      limits: {
        products: 1000,
        photos: -1,
        promotions: 5,
        analytics: true,
        support: 'phone',
        commission: 4
      },
      benefits: [
        'Минимальная комиссия',
        'Собственный брендинг',
        'API интеграция',
        'Выделенный менеджер',
        'Приоритет в поиске'
      ]
    },
    {
      id: 'enterprise',
      name: 'Корпоративный',
      price: 12900,
      yearlyPrice: 129000,
      description: 'Для крупнейших поставщиков',
      features: [
        'Неограниченное количество товаров',
        'Неограниченное количество фото',
        'Полная аналитика + BI',
        '24/7 поддержка',
        'Комиссия 2%',
        'Неограниченные акции',
        'Полный API',
        'Белый лейбл',
        'Персональные условия'
      ],
      limits: {
        products: -1,
        photos: -1,
        promotions: -1,
        analytics: true,
        support: '24/7',
        commission: 2
      },
      benefits: [
        'Самая низкая комиссия',
        'Полный контроль бренда',
        'Персональные условия',
        'Выделенная инфраструктура',
        'Консультации по развитию'
      ]
    }
  ];

  const getPrice = (plan: PricingPlan) => {
    const price = isYearly ? plan.yearlyPrice : plan.price;
    const savings = isYearly ? (plan.price * 12 - plan.yearlyPrice) : 0;
    return { price, savings };
  };

  const isPlanCurrent = (planId: string) => planId === currentPlan;

  const getRecommendedUpgrade = () => {
    const currentIndex = plans.findIndex(p => p.id === currentPlan);
    if (currentIndex < plans.length - 1) {
      return plans[currentIndex + 1];
    }
    return null;
  };

  const recommendedPlan = getRecommendedUpgrade();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Тарифные планы для поставщиков</h2>
        <p className="text-lg text-gray-600 mb-6">
          Выберите план, который поможет развить ваш бизнес на нашей платформе
        </p>
        
        {/* Переключатель месячный/годовой */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm ${!isYearly ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            Месячная оплата
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            Годовая оплата
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Экономия до 17%
            </Badge>
          )}
        </div>
      </div>

      {/* Рекомендация по апгрейду */}
      {recommendedPlan && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="TrendingUp" size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    Рекомендуем перейти на план "{recommendedPlan.name}"
                  </h3>
                  <p className="text-sm text-blue-700">
                    Снизите комиссию до {recommendedPlan.limits.commission}% и получите больше возможностей для роста
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Узнать больше
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Тарифные планы */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const { price, savings } = getPrice(plan);
          const isCurrent = isPlanCurrent(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-300 shadow-lg scale-105' : ''} ${
                isCurrent ? 'border-green-300 bg-green-50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    🔥 Популярный
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    ✅ Текущий план
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ₽/{isYearly ? 'год' : 'мес'}
                    </span>
                  </div>
                  
                  {isYearly && savings > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Экономия {savings.toLocaleString()} ₽/год
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Комиссия с продаж: {plan.limits.commission}%
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Icon name="Check" size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${isCurrent 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : ''
                  }`}
                  variant={isCurrent ? 'default' : plan.popular ? 'default' : 'outline'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Активный план' : 'Выбрать план'}
                </Button>

                {/* Дополнительные преимущества */}
                {plan.benefits.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wide">
                      Дополнительные преимущества:
                    </h4>
                    <div className="space-y-1">
                      {plan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Icon name="Star" size={12} className="text-yellow-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Сравнительная таблица */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Подробное сравнение планов
          </CardTitle>
          <CardDescription>
            Сравните возможности всех тарифных планов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium text-gray-900">Возможности</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 font-medium text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 text-gray-700">Количество товаров</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.limits.products === -1 ? '∞' : plan.limits.products}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-700">Фото на товар</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.limits.photos === -1 ? '∞' : plan.limits.photos}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-700">Акции в месяц</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.limits.promotions === -1 ? '∞' : plan.limits.promotions || '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-700">Аналитика</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3">
                      {plan.limits.analytics ? (
                        <Icon name="Check" size={16} className="text-green-500 mx-auto" />
                      ) : (
                        <Icon name="X" size={16} className="text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-700">Комиссия</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 font-medium">
                      {plan.limits.commission}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="HelpCircle" size={20} />
            Часто задаваемые вопросы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Можно ли изменить план в любое время?</h4>
              <p className="text-sm text-gray-600">
                Да, вы можете повысить план в любое время. При понижении плана изменения вступят в силу в следующем расчетном периоде.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Что происходит при превышении лимитов?</h4>
              <p className="text-sm text-gray-600">
                При приближении к лимитам мы пришлем уведомление. При превышении лимитов мы предложим перейти на более высокий план.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Есть ли скидки для долгосрочных контрактов?</h4>
              <p className="text-sm text-gray-600">
                Да, годовая оплата дает скидку до 17%. Для корпоративных клиентов доступны индивидуальные условия.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}