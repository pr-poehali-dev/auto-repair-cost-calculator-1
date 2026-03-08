import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

// Импорт созданных компонентов
import BudgetCalculator from './vip-advertising/BudgetCalculator';
import AvailableFormatsTab from './vip-advertising/AvailableFormatsTab';
import CampaignsTab from './vip-advertising/CampaignsTab';
import AnalyticsTab from './vip-advertising/AnalyticsTab';
import { VIPAdvertisingFormatsProps, CampaignSettings, vipFormatsData } from './vip-advertising/types';

export default function VIPAdvertisingFormats({ 
  currentTier = 'professional',
  className = "" 
}: VIPAdvertisingFormatsProps) {
  const [activeTab, setActiveTab] = useState('formats');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [campaignSettings, setCampaignSettings] = useState<CampaignSettings>({
    budget: 10000,
    duration: 7,
    targetAudience: 'all',
    autoOptimization: true
  });

  const availableFormats = vipFormatsData.filter(format => {
    if (currentTier === 'enterprise') return true;
    if (currentTier === 'professional') return format.tier === 'professional';
    return false;
  });

  const lockedFormats = vipFormatsData.filter(format => !availableFormats.includes(format));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VIP форматы рекламы</h2>
          <p className="text-gray-600">Эксклюзивные рекламные возможности для максимального охвата</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800">
            {currentTier === 'enterprise' ? 'Корпоративный' : 'Профессиональный'} тариф
          </Badge>
          <Button>
            <Icon name="Zap" size={16} className="mr-2" />
            Запустить кампанию
          </Button>
        </div>
      </div>

      {/* Калькулятор бюджета */}
      <BudgetCalculator 
        campaignSettings={campaignSettings}
        setCampaignSettings={setCampaignSettings}
        availableFormats={availableFormats}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="formats">Доступные форматы</TabsTrigger>
          <TabsTrigger value="campaigns">Мои кампании</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="formats">
          <AvailableFormatsTab 
            availableFormats={availableFormats}
            lockedFormats={lockedFormats}
          />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsTab availableFormats={availableFormats} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab availableFormats={availableFormats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}