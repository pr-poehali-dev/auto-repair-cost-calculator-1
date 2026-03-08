import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    currency: string;
  };
  orders: {
    total: number;
    growth: number;
  };
  views: {
    total: number;
    growth: number;
  };
  conversion: {
    rate: number;
    growth: number;
  };
  topProducts: Array<{
    id: number;
    name: string;
    revenue: number;
    orders: number;
    views: number;
    conversion: number;
  }>;
  monthlyStats: Array<{
    month: string;
    revenue: number;
    orders: number;
    views: number;
  }>;
}

interface SupplierAnalyticsProps {
  className?: string;
}

export default function SupplierAnalytics({ className = "" }: SupplierAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Моковые данные для демонстрации
    const mockData: AnalyticsData = {
      revenue: {
        total: 245670,
        growth: 23.5,
        currency: 'RUB'
      },
      orders: {
        total: 167,
        growth: 18.2
      },
      views: {
        total: 8540,
        growth: 15.7
      },
      conversion: {
        rate: 1.95,
        growth: 2.3
      },
      topProducts: [
        { id: 1, name: 'Офисные стулья "Комфорт"', revenue: 45600, orders: 23, views: 890, conversion: 2.6 },
        { id: 2, name: 'Столы рабочие "Премиум"', revenue: 38900, orders: 19, views: 765, conversion: 2.5 },
        { id: 3, name: 'Кресла руководителя', revenue: 32100, orders: 14, views: 612, conversion: 2.3 },
        { id: 4, name: 'Шкафы офисные', revenue: 28500, orders: 11, views: 543, conversion: 2.0 },
        { id: 5, name: 'Тумбы под документы', revenue: 19800, orders: 8, views: 445, conversion: 1.8 }
      ],
      monthlyStats: [
        { month: 'Янв', revenue: 189000, orders: 125, views: 6800 },
        { month: 'Фев', revenue: 198000, orders: 132, views: 7100 },
        { month: 'Мар', revenue: 215000, orders: 145, views: 7600 },
        { month: 'Апр', revenue: 232000, orders: 156, views: 8100 },
        { month: 'Май', revenue: 245670, orders: 167, views: 8540 }
      ]
    };

    // Симулируем загрузку
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalytics(mockData);
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 'TrendingUp' : 'TrendingDown';
  };

  if (loading || !analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и фильтры */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Аналитика продаж</h2>
          <p className="text-gray-600">Отслеживайте эффективность ваших товаров</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">3 месяца</SelectItem>
              <SelectItem value="1y">1 год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Выручка */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.revenue.total, analytics.revenue.currency)}
                </div>
                <div className={`flex items-center text-sm ${getGrowthColor(analytics.revenue.growth)}`}>
                  <Icon name={getGrowthIcon(analytics.revenue.growth)} size={16} className="mr-1" />
                  {Math.abs(analytics.revenue.growth)}%
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icon name="DollarSign" size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Заказы */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.orders.total)}
                </div>
                <div className={`flex items-center text-sm ${getGrowthColor(analytics.orders.growth)}`}>
                  <Icon name={getGrowthIcon(analytics.orders.growth)} size={16} className="mr-1" />
                  {Math.abs(analytics.orders.growth)}%
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon name="ShoppingBag" size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Просмотры */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Просмотры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.views.total)}
                </div>
                <div className={`flex items-center text-sm ${getGrowthColor(analytics.views.growth)}`}>
                  <Icon name={getGrowthIcon(analytics.views.growth)} size={16} className="mr-1" />
                  {Math.abs(analytics.views.growth)}%
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Icon name="Eye" size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Конверсия */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Конверсия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.conversion.rate}%
                </div>
                <div className={`flex items-center text-sm ${getGrowthColor(analytics.conversion.growth)}`}>
                  <Icon name={getGrowthIcon(analytics.conversion.growth)} size={16} className="mr-1" />
                  {Math.abs(analytics.conversion.growth)}%
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Icon name="Target" size={24} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Топ товары */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} />
            Топ-5 товаров по выручке
          </CardTitle>
          <CardDescription>
            Самые прибыльные товары за выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    <span className="text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{product.orders} заказов</span>
                      <span>{formatNumber(product.views)} просмотров</span>
                      <span>{product.conversion}% конверсия</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(product.revenue, analytics.revenue.currency)}
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                      🏆 Лидер
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* График продаж по месяцам */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Динамика продаж
          </CardTitle>
          <CardDescription>
            Выручка, заказы и просмотры по месяцам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyStats.map((stat, index) => (
              <div key={stat.month} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="font-medium text-gray-900 w-12">
                  {stat.month}
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(stat.revenue / Math.max(...analytics.monthlyStats.map(s => s.revenue))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(stat.revenue, analytics.revenue.currency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{stat.orders} заказов</span>
                  <span>{formatNumber(stat.views)} просмотров</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Рекомендации по улучшению */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Icon name="Lightbulb" size={20} />
            Рекомендации для роста
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="ArrowUp" size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Увеличьте конверсию</p>
                <p className="text-sm text-blue-700">Добавьте больше фотографий к товарам и улучшите описания</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Star" size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Продвигайте топ-товары</p>
                <p className="text-sm text-blue-700">Сделайте ваши лучшие товары "Рекомендованными" для большей видимости</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="TrendingUp" size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Запустите акции</p>
                <p className="text-sm text-blue-700">Создайте скидки на медленно продающиеся товары</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}