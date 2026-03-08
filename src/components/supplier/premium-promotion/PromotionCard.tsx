import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

interface PromotionCardProps {
  promotion: PremiumPromotion;
  isAvailable: boolean;
  getTypeIcon: (type: string) => string;
  getTypeColor: (type: string) => string;
}

export default function PromotionCard({ 
  promotion, 
  isAvailable, 
  getTypeIcon, 
  getTypeColor 
}: PromotionCardProps) {
  if (isAvailable) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(promotion.type)}`}>
                <Icon name={getTypeIcon(promotion.type) as any} size={18} />
              </div>
              <div>
                <CardTitle className="text-lg">{promotion.name}</CardTitle>
                <Badge className="bg-green-100 text-green-800 mt-1">
                  ✅ Активно
                </Badge>
              </div>
            </div>
            <Switch checked={promotion.active} />
          </div>
          <CardDescription>{promotion.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Возможности:</h4>
            <ul className="space-y-1">
              {promotion.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Check" size={12} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Результаты:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600">{promotion.metrics.impressions?.toLocaleString()}</div>
                <div className="text-blue-700">показов</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">{promotion.metrics.clicks?.toLocaleString()}</div>
                <div className="text-green-700">кликов</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-bold text-purple-600">{promotion.metrics.conversions}</div>
                <div className="text-purple-700">продаж</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-bold text-orange-600">{promotion.metrics.roi}%</div>
                <div className="text-orange-700">ROI</div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Icon name="Settings" size={16} className="mr-2" />
            Настроить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gray-200 bg-gray-50 opacity-75">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-200">
              <Icon name="Lock" size={18} className="text-gray-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-700">{promotion.name}</CardTitle>
              <Badge className="bg-gray-200 text-gray-600 mt-1">
                Требует {promotion.tier === 'professional' ? 'Профессиональный' : 'Корпоративный'} тариф
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-600">{promotion.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Что получите:</h4>
          <ul className="space-y-1">
            {promotion.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Star" size={12} className="text-yellow-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full">
          <Icon name="Crown" size={16} className="mr-2" />
          Повысить тариф
        </Button>
      </CardContent>
    </Card>
  );
}