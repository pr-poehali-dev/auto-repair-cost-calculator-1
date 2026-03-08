export interface PremiumPromotion {
  id: string;
  name: string;
  description: string;
  tier: 'basic' | 'professional' | 'enterprise';
  type: 'priority' | 'exclusive' | 'branding' | 'analytics';
  price: number;
  features: string[];
  benefits: string[];
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    roi?: number;
  };
  active: boolean;
}

export interface TierBenefits {
  name: string;
  color: string;
  promotions: string[];
}