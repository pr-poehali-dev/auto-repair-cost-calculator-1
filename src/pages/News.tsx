import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  author: string;
  company: string;
  content: string;
  date: string;
  avatar?: string;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  company: string;
  date: string;
  category: 'economy' | 'market' | 'business' | 'policy';
  readTime: string;
  image?: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Петр Иванов',
    company: 'ООО "Торгсоюз"',
    content: 'Очень актуальная информация! Мы уже видим рост заказов из стран БРИКС.',
    date: '2024-03-15',
  },
  {
    id: '2',
    author: 'Светлана Морозова',
    company: 'АО "Глобалтрейд"',
    content: 'Согласна с анализом. Особенно радует рост в сфере высокотехнологичной продукции.',
    date: '2024-03-15',
  }
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Рост экспорта российских товаров в страны БРИКС',
    description: 'По итогам третьего квартала экспорт российской продукции в страны БРИКС вырос на 23% по сравнению с аналогичным периодом прошлого года.',
    content: 'Детальный анализ показывает устойчивые тенденции роста торговых отношений между Россией и партнерами по БРИКС. Особенно активно развивается торговля с Китаем и Индией. Эксперты отмечают, что основной рост приходится на высокотехнологичную продукцию и товары обрабатывающей промышленности.',
    author: 'Иван Петров',
    company: 'ООО "Экспорт Плюс"',
    date: '2024-03-15',
    category: 'economy',
    readTime: '5 мин',
    image: '/img/362f4a8d-c95c-4a33-a331-7aed8fda79db.jpg',
    likes: 42,
    commentsCount: 8,
    comments: mockComments
  },
  {
    id: '2', 
    title: 'Новые возможности для малого и среднего бизнеса',
    description: 'Правительство анонсировало программу поддержки МСП с увеличенным размером субсидий и упрощенной процедурой получения.',
    content: 'Программа включает в себя несколько направлений поддержки: льготное кредитование, налоговые преференции и упрощение административных процедур. Размер субсидий увеличен до 5 млн рублей для производственных предприятий и до 3 млн рублей для сферы услуг.',
    author: 'Мария Сидорова',
    company: 'АО "Бизнес Консалтинг"',
    date: '2024-03-14',
    category: 'policy',
    readTime: '7 мин',
    image: '/img/6d3bd2ba-b4b6-4fca-8627-990d1c18fbc8.jpg',
    likes: 67,
    commentsCount: 12,
    comments: []
  },
  {
    id: '3',
    title: 'Цифровизация торговых площадок: тренды 2024',
    description: 'Исследование показывает, что 78% B2B компаний планируют увеличить инвестиции в цифровые торговые платформы.',
    content: 'Аналитики отмечают ключевые направления развития: интеграция с системами учета, использование машинного обучения для персонализации предложений, развитие мобильных приложений для B2B сегмента. Инвестиции в цифровизацию показывают ROI до 300%.',
    author: 'Алексей Волков',
    company: 'ПАО "ТехИнвест"',
    date: '2024-03-13',
    category: 'business',
    readTime: '4 мин',
    image: '/img/920b621f-0803-406a-bfa1-f3d8b85c1762.jpg',
    likes: 29,
    commentsCount: 5,
    comments: []
  },
  {
    id: '4',
    title: 'Налоговые льготы для IT-сферы продлены до 2030 года',
    description: 'Правительство РФ приняло решение о продлении льготного налогообложения для IT-компаний на период до 2030 года.',
    content: 'Решение направлено на поддержку развития отечественной IT-отрасли и привлечение талантов в технологический сектор. Льготная ставка налога на прибыль остается на уровне 3%, а социальные взносы - 7,6%.',
    author: 'Елена Кузнецова',
    company: 'ПАО "ТехноСфера"',
    date: '2024-03-12',
    category: 'policy',
    readTime: '6 мин',
    image: '/img/362f4a8d-c95c-4a33-a331-7aed8fda79db.jpg',
    likes: 91,
    commentsCount: 18,
    comments: []
  },
  {
    id: '5',
    title: 'Импортозамещение в промышленности: результаты года',
    description: 'По данным Минпромторга, доля отечественных товаров в ключевых отраслях промышленности выросла на 15%.',
    content: 'Наибольший рост наблюдается в машиностроении и химической промышленности. Российские предприятия активно осваивают производство компонентов, которые ранее импортировались. Это способствует укреплению технологической независимости.',
    author: 'Дмитрий Соколов',
    company: 'ООО "ПромРазвитие"',
    date: '2024-03-11',
    category: 'market',
    readTime: '8 мин',
    image: '/img/6d3bd2ba-b4b6-4fca-8627-990d1c18fbc8.jpg',
    likes: 73,
    commentsCount: 22,
    comments: []
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'economy': return 'bg-blue-100 text-blue-800';
    case 'market': return 'bg-green-100 text-green-800';
    case 'business': return 'bg-purple-100 text-purple-800';
    case 'policy': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'economy': return 'Экономика';
    case 'market': return 'Рынок';
    case 'business': return 'Бизнес';
    case 'policy': return 'Политика';
    default: return category;
  }
};

const News = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const itemsPerPage = 3;

  const categories = [
    { value: 'all', label: 'Все категории' },
    { value: 'economy', label: 'Экономика' },
    { value: 'market', label: 'Рынок' },
    { value: 'business', label: 'Бизнес' },
    { value: 'policy', label: 'Политика' }
  ];

  const filteredNews = mockNews
    .filter(news => {
      const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          news.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          news.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleComments = (newsId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }));
  };

  const handleCommentSubmit = (newsId: string) => {
    const comment = newComment[newsId];
    if (comment?.trim()) {
      console.log('Добавить комментарий:', { newsId, comment });
      setNewComment(prev => ({ ...prev, [newsId]: '' }));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Экономические новости
                </h1>
                <p className="text-lg text-gray-600">
                  Актуальная информация о рынке, экономике и бизнесе
                </p>
              </div>
              <Button 
                size="lg" 
                className="text-base font-semibold"
                onClick={() => navigate('/news/publish')}
              >
                <Icon name="PenSquare" size={18} className="mr-2" />
                Опубликовать новость
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium text-gray-700">
                  Поиск новостей
                </label>
                <Input
                  id="search"
                  placeholder="Поиск по названию, описанию, компании..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Категория
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Сортировка
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Сортировать по..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">По дате</SelectItem>
                    <SelectItem value="title">По названию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {paginatedNews.map((news) => (
              <Card key={news.id} className="overflow-hidden">
                <div className="relative">
                  {news.image && (
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor(news.category)}>
                      {getCategoryLabel(news.category)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-3">
                        {news.title}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-700 mb-4">
                        {news.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {getInitials(news.author)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{news.author}</p>
                            <p className="text-xs text-gray-500">{news.company}</p>
                          </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center">
                          <Icon name="Calendar" size={14} className="mr-1" />
                          <span>{new Date(news.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center">
                          <Icon name="Clock" size={14} className="mr-1" />
                          <span>{news.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {news.content}
                  </p>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Icon name="Heart" size={16} className="mr-2" />
                        {news.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600"
                        onClick={() => toggleComments(news.id)}
                      >
                        <Icon name="MessageSquare" size={16} className="mr-2" />
                        {news.commentsCount} комментариев
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Icon name="Share2" size={16} className="mr-2" />
                        Поделиться
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/news/${news.id}`)}
                    >
                      Читать полностью
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </div>

                  {expandedComments[news.id] && (
                    <div className="mt-6 border-t pt-4">
                      <div className="space-y-4 mb-4">
                        {news.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-100">
                                {getInitials(comment.author)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{comment.author}</span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">{comment.company}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-3">
                                {new Date(comment.date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            ВЫ
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Напишите комментарий..."
                            value={newComment[news.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [news.id]: e.target.value }))}
                            className="min-h-[80px]"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleCommentSubmit(news.id)}
                            disabled={!newComment[news.id]?.trim()}
                          >
                            Отправить
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          )}

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Новости не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска или выбрать другую категорию
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;