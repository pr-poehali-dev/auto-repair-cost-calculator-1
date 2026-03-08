import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface PremiumPromotion {
  id: string;
  name: string;
  description: string;
  tier: 'basic' | 'professional' | 'enterprise';
  type: 'priority' | 'exclusive' | 'branding' | 'analytics';
  price: number;
  features: string[];
  benefits: string[];
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    roi?: number;
  };
  active: boolean;
}

interface UpgradeTabProps {
  upgradePromotions: PremiumPromotion[];
  getTypeIcon: (type: string) => string;
}

export default function UpgradeTab({ upgradePromotions, getTypeIcon }: UpgradeTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Crown" size={20} />
          Что получите при повышении тарифа
        </CardTitle>
        <CardDescription>
          Дополнительные инструменты продвижения на более высоких тарифах
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upgradePromotions.length > 0 ? (
          <div className="space-y-6">
            {upgradePromotions.map((promotion) => (
              <div key={promotion.id} className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Icon name={getTypeIcon(promotion.type) as any} size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-900">{promotion.name}</h4>
                      <p className="text-sm text-yellow-700">{promotion.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-200 text-yellow-800">
                    Новое!
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-yellow-900 mb-2">Возможности:</h5>
                    <ul className="space-y-1">
                      {promotion.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                          <Icon name="Star" size={12} className="text-yellow-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-yellow-900 mb-2">Ожидаемые результаты:</h5>
                    <ul className="space-y-1">
                      {promotion.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                          <Icon name="TrendingUp" size={12} className="text-yellow-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center pt-4">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                <Icon name="Crown" size={20} className="mr-2" />
                Повысить тариф и получить все инструменты
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-green-100 rounded-lg inline-block mb-4">
              <Icon name="Crown" size={48} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              🎉 У вас максимальный тариф!
            </h3>
            <p className="text-green-700">
              Вы имеете доступ ко всем инструментам продвижения на платформе
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}