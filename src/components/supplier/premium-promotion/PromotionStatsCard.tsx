import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PromotionStatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export default function PromotionStatsCard({ 
  title, 
  value, 
  icon, 
  color 
}: PromotionStatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 ${color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg`}>
            <Icon name={icon as any} size={20} className={color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}