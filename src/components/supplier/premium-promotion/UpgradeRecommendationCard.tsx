import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface UpgradeRecommendationCardProps {
  upgradePromotions: PremiumPromotion[];
}

export default function UpgradeRecommendationCard({ upgradePromotions }: UpgradeRecommendationCardProps) {
  if (upgradePromotions.length === 0) return null;

  return (
    <Card className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Icon name="Crown" size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-900 text-lg">
                🚀 Получите {upgradePromotions.length} новых инструментов продвижения!
              </h3>
              <p className="text-yellow-700 mt-1">
                Повысьте тариф и получите доступ к эксклюзивным форматам рекламы
              </p>
              <div className="flex items-center gap-4 mt-2">
                {upgradePromotions.slice(0, 3).map((promo, index) => (
                  <Badge key={index} className="bg-yellow-200 text-yellow-800">
                    {promo.name}
                  </Badge>
                ))}
                {upgradePromotions.length > 3 && (
                  <span className="text-sm text-yellow-700">+{upgradePromotions.length - 3} еще</span>
                )}
              </div>
            </div>
          </div>
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            Повысить тариф
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}