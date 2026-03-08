import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { MarketingInsight } from './types';

export default function InsightsTab() {
  const marketingInsights: MarketingInsight[] = [
    {
      metric: 'Конверсия email-рассылок',
      value: '8.3%',
      trend: '+12%',
      recommendation: 'Увеличьте частоту персонализированных предложений'
    },
    {
      metric: 'Эффективность соцсетей',
      value: '156 переходов',
      trend: '+34%',
      recommendation: 'Запустите рекламу в Telegram для расширения охвата'
    },
    {
      metric: 'SEO позиции',
      value: 'ТОП-10',
      trend: '+5 позиций',
      recommendation: 'Добавьте больше ключевых слов в описания товаров'
    },
    {
      metric: 'Управление отзывами',
      value: '4.7/5',
      trend: '+0.3',
      recommendation: 'Продолжайте быстро отвечать на отзывы клиентов'
    }
  ];

  const channelData = [
    { channel: 'Email-маркетинг', traffic: 1240, conversion: 8.3, roi: 340 },
    { channel: 'Социальные сети', traffic: 890, conversion: 4.1, roi: 180 },
    { channel: 'SEO-оптимизация', traffic: 2150, conversion: 12.7, roi: 520 },
    { channel: 'Управление отзывами', traffic: 0, conversion: 0, roi: 290 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingInsights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{insight.metric}</p>
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  {insight.trend}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{insight.value}</p>
              <p className="text-xs text-gray-600">{insight.recommendation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Детальная аналитика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Эффективность маркетинговых каналов
          </CardTitle>
          <CardDescription>
            Сравнение результативности различных инструментов продвижения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelData.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="font-medium text-gray-900">{channel.channel}</div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{channel.traffic || '—'}</div>
                    <div className="text-gray-600">переходов</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{channel.conversion || '—'}%</div>
                    <div className="text-gray-600">конверсия</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{channel.roi}%</div>
                    <div className="text-gray-600">ROI</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}