export interface MarketingTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'automation' | 'content' | 'analytics' | 'communication';
  premium: boolean;
  price?: string;
  features: string[];
  benefits: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export interface MarketingInsight {
  metric: string;
  value: string;
  trend: string;
  recommendation: string;
}

export interface PromoSettings {
  autoDiscount: boolean;
  seasonalPromotions: boolean;
  lowStockAlerts: boolean;
  priceTracking: boolean;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'automation': return 'Bot';
    case 'content': return 'FileText';
    case 'analytics': return 'BarChart3';
    case 'communication': return 'MessageSquare';
    default: return 'Star';
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'automation': return 'bg-purple-100 text-purple-800';
    case 'content': return 'bg-blue-100 text-blue-800';
    case 'analytics': return 'bg-green-100 text-green-800';
    case 'communication': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};