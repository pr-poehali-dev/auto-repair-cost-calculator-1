import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { VIPAdFormat, getPriceDisplay } from './types';

interface AnalyticsTabProps {
  availableFormats: VIPAdFormat[];
}

export default function AnalyticsTab({ availableFormats }: AnalyticsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BarChart3" size={20} />
          Эффективность VIP рекламы
        </CardTitle>
        <CardDescription>
          Детальная аналитика по всем форматам рекламы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.4M</div>
              <div className="text-sm text-gray-600">Общие показы</div>
              <div className="text-xs text-green-600">+18% к прошлому месяцу</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">8.7%</div>
              <div className="text-sm text-gray-600">Средний CTR</div>
              <div className="text-xs text-green-600">+2.3% к среднему</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">340%</div>
              <div className="text-sm text-gray-600">Средний ROI</div>
              <div className="text-xs text-green-600">+45% к цели</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Сравнение форматов</h4>
            <div className="space-y-3">
              {availableFormats.map((format, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{format.name}</h5>
                    <Badge className="bg-purple-100 text-purple-800">
                      ROI: {format.performance.averageROI}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="font-medium text-blue-600">
                        {format.performance.impressionsPerDay.toLocaleString()}
                      </div>
                      <div className="text-gray-600">показов</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">
                        {format.performance.averageCTR}%
                      </div>
                      <div className="text-gray-600">CTR</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">
                        {format.performance.conversionRate}%
                      </div>
                      <div className="text-gray-600">конверсия</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">
                        {getPriceDisplay(format)}
                      </div>
                      <div className="text-gray-600">цена</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}