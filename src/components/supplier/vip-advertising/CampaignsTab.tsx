import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { VIPAdFormat, getPriceDisplay } from './types';

interface CampaignsTabProps {
  availableFormats: VIPAdFormat[];
}

export default function CampaignsTab({ availableFormats }: CampaignsTabProps) {
  const activeFormats = availableFormats.filter(f => f.active);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BarChart3" size={20} />
          Активные рекламные кампании
        </CardTitle>
        <CardDescription>
          Управление текущими VIP кампаниями
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeFormats.map((format) => (
            <div key={format.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="Play" size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{format.name}</h4>
                    <p className="text-sm text-gray-600">{getPriceDisplay(format)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Активна</Badge>
                  <Button size="sm" variant="outline">
                    <Icon name="Pause" size={14} className="mr-1" />
                    Пауза
                  </Button>
                  <Button size="sm" variant="outline">
                    <Icon name="Settings" size={14} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{format.performance.impressionsPerDay.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">показов/день</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{format.performance.averageCTR}%</div>
                  <div className="text-sm text-green-700">CTR</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">{format.performance.conversionRate}%</div>
                  <div className="text-sm text-purple-700">конверсия</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{format.performance.averageROI}%</div>
                  <div className="text-sm text-orange-700">ROI</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Дневной бюджет: 5,000 ₽</span>
                  <span>Потрачено: 3,240 ₽ (65%)</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </div>
          ))}

          {activeFormats.length === 0 && (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                <Icon name="PauseCircle" size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных кампаний</h3>
              <p className="text-gray-600 mb-4">
                Запустите VIP рекламу для максимального охвата аудитории
              </p>
              <Button>
                <Icon name="Play" size={16} className="mr-2" />
                Создать кампанию
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}