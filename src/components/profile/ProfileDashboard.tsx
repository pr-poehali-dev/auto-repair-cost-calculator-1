import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface ProfileDashboardProps {
  className?: string;
}

export default function ProfileDashboard({ className = "" }: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalProducts: 127,
    activeProducts: 89,
    totalOrders: 342,
    totalRevenue: 1250000,
    monthlyGrowth: 12.5,
    avgRating: 4.8
  };

  const recentProducts = [
    { id: 1, name: "Смартфон iPhone 15", price: 89990, status: "active", orders: 23 },
    { id: 2, name: "Ноутбук MacBook Air", price: 129990, status: "pending", orders: 8 },
    { id: 3, name: "Наушники AirPods Pro", price: 24990, status: "active", orders: 45 }
  ];

  const recentOrders = [
    { id: "ORD-001", product: "Смартфон iPhone 15", amount: 89990, status: "completed", date: "2024-09-20" },
    { id: "ORD-002", product: "Ноутбук MacBook Air", amount: 129990, status: "processing", date: "2024-09-19" },
    { id: "ORD-003", product: "Наушники AirPods Pro", amount: 24990, status: "shipped", date: "2024-09-18" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'pending': return 'На модерации';
      case 'completed': return 'Завершён';
      case 'processing': return 'В обработке';
      case 'shipped': return 'Отправлен';
      default: return status;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          <p className="text-gray-600">Управляйте товарами, заказами и отслеживайте статистику</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
            <Icon name="Crown" size={14} className="mr-1" />
            Премиум продавец
          </Badge>
          <Button>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего товаров</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500">{stats.activeProducts} активных</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon name="Package" size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">+{stats.monthlyGrowth}% за месяц</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="ShoppingBag" size={20} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(stats.totalRevenue / 1000).toFixed(0)}K ₽
                </p>
                <p className="text-xs text-gray-500">Этот месяц</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon name="TrendingUp" size={20} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Рейтинг</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgRating}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Icon name="Star" size={12} className="text-yellow-500 mr-1" />
                  Средняя оценка
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Icon name="Award" size={20} className="text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="products">Мои товары</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Последние товары */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Package" size={18} />
                  Последние товары
                </CardTitle>
                <CardDescription>Недавно добавленные или обновлённые товары</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.price.toLocaleString()} ₽</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">{product.orders} заказов</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить новый товар
                </Button>
              </CardContent>
            </Card>

            {/* Последние заказы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingBag" size={18} />
                  Последние заказы
                </CardTitle>
                <CardDescription>Недавние заказы ваших товаров</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.product}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{order.amount.toLocaleString()} ₽</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все заказы
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление товарами</CardTitle>
              <CardDescription>Добавляйте, редактируйте и управляйте вашими товарами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                  <Icon name="Package" size={48} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Подробное управление товарами</h3>
                <p className="text-gray-600 mb-4">Здесь будет полный интерфейс для управления товарами</p>
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить первый товар
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История заказов</CardTitle>
              <CardDescription>Все заказы ваших товаров с детальной информацией</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                  <Icon name="ShoppingBag" size={48} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Управление заказами</h3>
                <p className="text-gray-600">Отслеживайте и управляйте всеми заказами</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика и статистика</CardTitle>
              <CardDescription>Детальная аналитика продаж и эффективности товаров</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                  <Icon name="BarChart3" size={48} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Подробная аналитика</h3>
                <p className="text-gray-600">Графики, отчёты и insights по вашим продажам</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки профиля</CardTitle>
              <CardDescription>Управление аккаунтом, уведомлениями и предпочтениями</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-lg inline-block mb-4">
                  <Icon name="Settings" size={48} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Настройки аккаунта</h3>
                <p className="text-gray-600">Персонализация профиля и настройки безопасности</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}