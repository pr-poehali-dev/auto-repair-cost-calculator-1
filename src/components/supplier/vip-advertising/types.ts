export interface VIPAdFormat {
  id: string;
  name: string;
  description: string;
  tier: 'professional' | 'enterprise';
  price: number;
  priceType: 'daily' | 'monthly' | 'click' | 'impression';
  placements: string[];
  specifications: {
    size?: string;
    duration?: string;
    targeting?: string[];
    frequency?: string;
  };
  performance: {
    averageCTR: number;
    averageROI: number;
    impressionsPerDay: number;
    conversionRate: number;
  };
  features: string[];
  active: boolean;
}

export interface VIPAdvertisingFormatsProps {
  currentTier: 'starter' | 'basic' | 'professional' | 'enterprise';
  className?: string;
}

export interface CampaignSettings {
  budget: number;
  duration: number;
  targetAudience: string;
  autoOptimization: boolean;
}

export const getPriceDisplay = (format: VIPAdFormat): string => {
  const typeMap = {
    daily: 'день',
    monthly: 'месяц', 
    click: 'клик',
    impression: '1000 показов'
  };
  return `${format.price.toLocaleString()} ₽/${typeMap[format.priceType]}`;
};

export const vipFormatsData: VIPAdFormat[] = [
  {
    id: 'homepage-hero',
    name: 'Главный баннер сайта',
    description: 'Огромный баннер в верхней части главной страницы - первое что видят все посетители',
    tier: 'enterprise',
    price: 15000,
    priceType: 'daily',
    placements: ['Главная страница - верх', 'Мобильная версия'],
    specifications: {
      size: '1200x400px (десктоп), 320x200px (мобайл)',
      duration: 'Ротация каждые 5 секунд',
      targeting: ['География', 'Интересы', 'Время дня'],
      frequency: 'Максимум 3 показа в день на пользователя'
    },
    performance: {
      averageCTR: 4.8,
      averageROI: 320,
      impressionsPerDay: 150000,
      conversionRate: 2.1
    },
    features: [
      'Максимальная видимость',
      'Первый показ всем посетителям',
      'Адаптивный дизайн',
      'Видео-поддержка',
      'A/B тестирование'
    ],
    active: false
  },
  {
    id: 'category-takeover',
    name: 'Полное оформление категории',
    description: 'Ваш бренд и товары занимают всю страницу категории - покупатели видят только вас',
    tier: 'enterprise',
    price: 8000,
    priceType: 'daily',
    placements: ['Страницы категорий', 'Фильтры товаров', 'Сайдбар'],
    specifications: {
      size: 'Различные размеры под дизайн страницы',
      duration: 'Весь день на выбранной категории',
      targeting: ['Конкретные категории', 'Поведение', 'История покупок'],
      frequency: 'Постоянно для целевой аудитории'
    },
    performance: {
      averageCTR: 12.3,
      averageROI: 580,
      impressionsPerDay: 45000,
      conversionRate: 8.7
    },
    features: [
      'Эксклюзивность в категории',
      'Брендинг всей страницы',
      'Множественные точки контакта',
      'Интеграция с каталогом',
      'Персонализация контента'
    ],
    active: true
  },
  {
    id: 'video-advertising',
    name: 'Видеореклама премиум',
    description: 'Короткие рекламные ролики в стратегических местах сайта с высоким вовлечением',
    tier: 'professional',
    price: 50,
    priceType: 'click',
    placements: ['Между товарами', 'В результатах поиска', 'В карточках товаров'],
    specifications: {
      size: '16:9, до 30 секунд',
      duration: 'По кликам',
      targeting: ['Демография', 'Интересы', 'Предыдущие покупки'],
      frequency: 'Максимум 2 ролика в сессию'
    },
    performance: {
      averageCTR: 8.9,
      averageROI: 240,
      impressionsPerDay: 25000,
      conversionRate: 5.2
    },
    features: [
      'Высокое вовлечение',
      'Эмоциональное воздействие',
      'Звуковое сопровождение',
      'Интерактивные элементы',
      'Детальная аналитика'
    ],
    active: false
  },
  {
    id: 'push-notifications',
    name: 'VIP push-уведомления',
    description: 'Персональные push-уведомления о ваших товарах и акциях прямо на устройства покупателей',
    tier: 'professional',
    price: 5,
    priceType: 'impression',
    placements: ['Мобильные устройства', 'Десктоп браузеры', 'PWA приложение'],
    specifications: {
      size: 'Заголовок 50 символов, текст 125 символов',
      duration: 'Мгновенная доставка',
      targeting: ['Поведение', 'Геолокация', 'Время активности'],
      frequency: 'До 3 уведомлений в неделю'
    },
    performance: {
      averageCTR: 15.7,
      averageROI: 450,
      impressionsPerDay: 12000,
      conversionRate: 12.8
    },
    features: [
      'Мгновенная доставка',
      'Высокий CTR',
      'Персонализация',
      'Геотаргетинг',
      'Контроль частоты'
    ],
    active: true
  },
  {
    id: 'search-spotlight',
    name: 'Прожектор в поиске',
    description: 'Ваши товары всегда в топ-3 результатов поиска с премиум оформлением',
    tier: 'professional',
    price: 25,
    priceType: 'click',
    placements: ['Результаты поиска', 'Автодополнение', 'Популярные запросы'],
    specifications: {
      size: 'Увеличенная карточка товара',
      duration: 'По ключевым словам',
      targeting: ['Поисковые запросы', 'История поиска', 'Категории'],
      frequency: 'При каждом релевантном поиске'
    },
    performance: {
      averageCTR: 18.4,
      averageROI: 380,
      impressionsPerDay: 35000,
      conversionRate: 11.2
    },
    features: [
      'Гарантированный топ-3',
      'Премиум оформление',
      'Множественные фото',
      'Расширенное описание',
      'Бейджи качества'
    ],
    active: true
  },
  {
    id: 'email-exclusive',
    name: 'Эксклюзивные email-кампании',
    description: 'Персональные рассылки с вашими товарами целевой аудитории с высокой вероятностью покупки',
    tier: 'professional',
    price: 3500,
    priceType: 'monthly',
    placements: ['Email рассылки', 'Триггерные письма', 'Дайджесты'],
    specifications: {
      size: 'Полноформатные баннеры в письмах',
      duration: 'Ежемесячные кампании',
      targeting: ['Покупательская история', 'Предпочтения', 'Сегментация'],
      frequency: '2-4 рассылки в месяц'
    },
    performance: {
      averageCTR: 6.2,
      averageROI: 290,
      impressionsPerDay: 8000,
      conversionRate: 7.8
    },
    features: [
      'Высокая релевантность',
      'Персонализация',
      'A/B тестирование писем',
      'Сегментация аудитории',
      'Детальная аналитика'
    ],
    active: false
  }
];