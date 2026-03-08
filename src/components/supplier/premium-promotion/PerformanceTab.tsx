import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface PerformanceTabProps {
  availablePromotions: PremiumPromotion[];
  getTypeColor: (type: string) => string;
}

export default function PerformanceTab({ availablePromotions, getTypeColor }: PerformanceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BarChart3" size={20} />
          Эффективность инструментов продвижения
        </CardTitle>
        <CardDescription>
          Сравнение результативности различных форматов рекламы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {availablePromotions.map((promotion, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{promotion.name}</h4>
                <Badge className={getTypeColor(promotion.type)}>
                  ROI: {promotion.metrics.roi}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {promotion.metrics.impressions?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Показы</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {promotion.metrics.clicks?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Клики</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {promotion.metrics.conversions}
                  </div>
                  <div className="text-sm text-gray-600">Продажи</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {promotion.metrics.roi}%
                  </div>
                  <div className="text-sm text-gray-600">ROI</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CTR (кликабельность)</span>
                  <span>{((promotion.metrics.clicks! / promotion.metrics.impressions!) * 100).toFixed(2)}%</span>
                </div>
                <Progress 
                  value={(promotion.metrics.clicks! / promotion.metrics.impressions!) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}