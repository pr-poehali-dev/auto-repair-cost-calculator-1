import React from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProductBadgesProps {
  isNew?: boolean;
  isBestseller?: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
  isFeatured?: boolean;
  className?: string;
}

export default function ProductBadges({ 
  isNew = false,
  isBestseller = false, 
  hasDiscount = false,
  discountPercentage = 0,
  isFeatured = false,
  className = ''
}: ProductBadgesProps) {
  const badges = [];

  if (hasDiscount && discountPercentage > 0) {
    badges.push(
      <Badge key="discount" variant="destructive" className="bg-red-500 hover:bg-red-600">
        <Icon name="Percent" size={12} className="mr-1" />
        -{discountPercentage}%
      </Badge>
    );
  }

  if (isNew) {
    badges.push(
      <Badge key="new" variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
        <Icon name="Sparkles" size={12} className="mr-1" />
        Новинка
      </Badge>
    );
  }

  if (isBestseller) {
    badges.push(
      <Badge key="bestseller" variant="default" className="bg-orange-500 hover:bg-orange-600">
        <Icon name="TrendingUp" size={12} className="mr-1" />
        Хит продаж
      </Badge>
    );
  }

  if (isFeatured) {
    badges.push(
      <Badge key="featured" variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
        <Icon name="Star" size={12} className="mr-1" />
        Рекомендуем
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges}
    </div>
  );
}