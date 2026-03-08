import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { MarketingTool, getCategoryColor } from './types';

interface MarketingToolCardProps {
  tool: MarketingTool;
}

export default function MarketingToolCard({ tool }: MarketingToolCardProps) {
  return (
    <Card className={`relative ${tool.premium ? 'border-yellow-300' : ''}`}>
      {tool.premium && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            ⭐ PRO
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
            <Icon name={tool.icon as any} size={20} />
          </div>
          <div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            {tool.price && (
              <p className="text-sm font-medium text-green-600">{tool.price}</p>
            )}
          </div>
        </div>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Возможности:</h4>
          <ul className="space-y-1">
            {tool.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Check" size={12} className="text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Результат:</h4>
          <ul className="space-y-1">
            {tool.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                <Icon name="TrendingUp" size={12} className="text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full" variant={tool.premium ? 'default' : 'outline'}>
          {tool.premium ? 'Подключить PRO' : 'Настроить'}
        </Button>
      </CardContent>
    </Card>
  );
}