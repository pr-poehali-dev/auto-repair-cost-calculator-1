import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { PromoSettings } from './types';

interface QuickSettingsCardProps {
  promoSettings: PromoSettings;
  setPromoSettings: (settings: PromoSettings) => void;
}

export default function QuickSettingsCard({ promoSettings, setPromoSettings }: QuickSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={20} />
          Быстрые настройки автоматизации
        </CardTitle>
        <CardDescription>
          Включите автоматические функции для экономии времени
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Автоскидки</h4>
              <p className="text-sm text-gray-600">Автоматические скидки при низких продажах</p>
            </div>
            <Switch
              checked={promoSettings.autoDiscount}
              onCheckedChange={(checked) => setPromoSettings({...promoSettings, autoDiscount: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Сезонные акции</h4>
              <p className="text-sm text-gray-600">Автоматические праздничные скидки</p>
            </div>
            <Switch
              checked={promoSettings.seasonalPromotions}
              onCheckedChange={(checked) => setPromoSettings({...promoSettings, seasonalPromotions: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Уведомления об остатках</h4>
              <p className="text-sm text-gray-600">Алерты при низких складских остатках</p>
            </div>
            <Switch
              checked={promoSettings.lowStockAlerts}
              onCheckedChange={(checked) => setPromoSettings({...promoSettings, lowStockAlerts: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Мониторинг цен</h4>
              <p className="text-sm text-gray-600">Отслеживание цен конкурентов</p>
            </div>
            <Switch
              checked={promoSettings.priceTracking}
              onCheckedChange={(checked) => setPromoSettings({...promoSettings, priceTracking: checked})}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}