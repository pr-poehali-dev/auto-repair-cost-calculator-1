import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { CampaignSettings, VIPAdFormat } from './types';

interface BudgetCalculatorProps {
  campaignSettings: CampaignSettings;
  setCampaignSettings: (settings: CampaignSettings) => void;
  availableFormats: VIPAdFormat[];
}

export default function BudgetCalculator({ 
  campaignSettings, 
  setCampaignSettings, 
  availableFormats 
}: BudgetCalculatorProps) {
  const getTotalBudget = () => {
    return campaignSettings.budget.toLocaleString();
  };

  const getEstimatedResults = () => {
    const avgROI = availableFormats.reduce((sum, f) => sum + f.performance.averageROI, 0) / availableFormats.length;
    const estimatedRevenue = campaignSettings.budget * (avgROI / 100);
    const estimatedProfit = estimatedRevenue - campaignSettings.budget;
    return { estimatedRevenue, estimatedProfit, avgROI };
  };

  const { estimatedRevenue, estimatedProfit, avgROI } = getEstimatedResults();

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calculator" size={20} />
          Калькулятор рекламного бюджета
        </CardTitle>
        <CardDescription>
          Рассчитайте ожидаемую прибыль от VIP-рекламы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="budget">Бюджет на рекламу</Label>
            <Input
              id="budget"
              type="number"
              value={campaignSettings.budget}
              onChange={(e) => setCampaignSettings({...campaignSettings, budget: parseInt(e.target.value) || 0})}
              placeholder="10000"
            />
            <p className="text-xs text-gray-600 mt-1">рублей</p>
          </div>
          
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{getTotalBudget()} ₽</div>
            <div className="text-sm text-blue-700">Бюджет</div>
          </div>
          
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="text-lg font-bold text-green-600">{estimatedRevenue.toLocaleString()} ₽</div>
            <div className="text-sm text-green-700">Ожидаемая выручка</div>
          </div>
          
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="text-lg font-bold text-purple-600">+{estimatedProfit.toLocaleString()} ₽</div>
            <div className="text-sm text-purple-700">Прибыль (ROI {Math.round(avgROI)}%)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}