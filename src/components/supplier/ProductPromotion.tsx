import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  main_image_url?: string;
  price: number;
  currency: string;
  stock_quantity: number;
  is_featured: boolean;
  status: string;
}

interface PromotionCampaign {
  id: string;
  type: 'featured' | 'discount' | 'boost' | 'banner';
  title: string;
  description: string;
  productIds: number[];
  startDate: string;
  endDate: string;
  budget: number;
  status: 'active' | 'paused' | 'completed';
  stats: {
    views: number;
    clicks: number;
    sales: number;
    spent: number;
  };
}

interface ProductPromotionProps {
  products: Product[];
  className?: string;
}

export default function ProductPromotion({ products, className = "" }: ProductPromotionProps) {
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([
    {
      id: '1',
      type: 'featured',
      title: 'Продвижение офисных стульев',
      description: 'Показ в блоке "Рекомендуем" на главной странице',
      productIds: [1, 2],
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      budget: 15000,
      status: 'active',
      stats: { views: 8540, clicks: 234, sales: 12, spent: 8750 }
    },
    {
      id: '2',
      type: 'discount',
      title: 'Скидка 20% на столы',
      description: 'Автоматическая скидка для привлечения покупателей',
      productIds: [3, 4],
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      budget: 25000,
      status: 'active',
      stats: { views: 5420, clicks: 187, sales: 8, spent: 12300 }
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    type: 'featured' as const,
    title: '',
    description: '',
    productIds: [] as number[],
    startDate: '',
    endDate: '',
    budget: 0
  });

  const promotionTypes = [
    {
      type: 'featured' as const,
      title: 'Рекомендованный товар',
      description: 'Показ в блоке "Рекомендуем" на главной странице',
      price: '50 руб/день за товар',
      icon: 'Star',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      type: 'boost' as const,
      title: 'Продвижение в поиске',
      description: 'Приоритетный показ в результатах поиска',
      price: '3 руб/клик',
      icon: 'TrendingUp',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'banner' as const,
      title: 'Баннерная реклама',
      description: 'Размещение на главной странице и в каталоге',
      price: 'от 1000 руб/день',
      icon: 'Monitor',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      type: 'discount' as const,
      title: 'Автоскидки',
      description: 'Система автоматических скидок для увеличения продаж',
      price: '5% от продажи',
      icon: 'Percent',
      color: 'bg-red-100 text-red-800'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'paused': return 'Приостановлена';
      case 'completed': return 'Завершена';
      default: return status;
    }
  };

  const handleCreateCampaign = () => {
    const campaign: PromotionCampaign = {
      id: (campaigns.length + 1).toString(),
      ...newCampaign,
      status: 'active',
      stats: { views: 0, clicks: 0, sales: 0, spent: 0 }
    };
    
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      type: 'featured',
      title: '',
      description: '',
      productIds: [],
      startDate: '',
      endDate: '',
      budget: 0
    });
    setShowCreateForm(false);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' as any }
        : campaign
    ));
  };

  const calculateROI = (campaign: PromotionCampaign) => {
    const avgOrderValue = 2500; // Средний чек
    const revenue = campaign.stats.sales * avgOrderValue;
    const roi = campaign.stats.spent > 0 ? ((revenue - campaign.stats.spent) / campaign.stats.spent) * 100 : 0;
    return roi;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Продвижение товаров</h2>
          <p className="text-gray-600">Увеличьте продажи с помощью рекламных инструментов</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Icon name="Plus" size={16} />
          Создать кампанию
        </Button>
      </div>

      {/* Типы продвижения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Megaphone" size={20} />
            Доступные инструменты продвижения
          </CardTitle>
          <CardDescription>
            Выберите подходящий способ для увеличения видимости ваших товаров
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotionTypes.map((promo) => (
              <div key={promo.type} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${promo.color}`}>
                    <Icon name={promo.icon as any} size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{promo.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-green-600">{promo.price}</span>
                      <Button size="sm" variant="outline">
                        Настроить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Активные кампании */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Активные кампании
          </CardTitle>
          <CardDescription>
            Управляйте текущими рекламными кампаниями
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                      <Badge variant="outline">
                        {promotionTypes.find(p => p.type === campaign.type)?.title}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 {campaign.startDate} - {campaign.endDate}</span>
                      <span>💰 Бюджет: {campaign.budget.toLocaleString()} руб</span>
                      <span>📦 Товаров: {campaign.productIds.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={campaign.status === 'active'} 
                      onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                    />
                    <Button variant="outline" size="sm">
                      <Icon name="Settings" size={14} />
                    </Button>
                  </div>
                </div>

                {/* Статистика кампании */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {campaign.stats.views.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Показы</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {campaign.stats.clicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Клики</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {campaign.stats.sales}
                    </div>
                    <div className="text-xs text-gray-600">Продажи</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {campaign.stats.spent.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-gray-600">Потрачено</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${calculateROI(campaign) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateROI(campaign).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">ROI</div>
                  </div>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="text-center py-8">
                <Icon name="Megaphone" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных кампаний</h3>
                <p className="text-gray-600 mb-4">Создайте первую рекламную кампанию для продвижения ваших товаров</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Создать кампанию
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Форма создания кампании */}
      {showCreateForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Plus" size={20} />
              Создать новую кампанию
            </CardTitle>
            <CardDescription>
              Настройте параметры рекламной кампании
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaignType">Тип кампании</Label>
                <Select value={newCampaign.type} onValueChange={(value: any) => setNewCampaign({...newCampaign, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionTypes.map((type) => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Бюджет (руб)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                  placeholder="10000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Название кампании</Label>
              <Input
                id="title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                placeholder="Продвижение новой коллекции"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                placeholder="Краткое описание цели кампании"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateCampaign}>
                Создать кампанию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Советы по продвижению */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Icon name="Lightbulb" size={20} />
            Советы по эффективному продвижению
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="Target" size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Начните с малого бюджета</p>
                <p className="text-sm text-green-700">Тестируйте кампании с небольшим бюджетом, затем масштабируйте успешные</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Camera" size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Качественные фото = больше продаж</p>
                <p className="text-sm text-green-700">Товары с хорошими фотографиями продаются в 3 раза лучше</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="BarChart3" size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Отслеживайте ROI</p>
                <p className="text-sm text-green-700">Приостанавливайте кампании с ROI ниже 50% и инвестируйте в успешные</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}