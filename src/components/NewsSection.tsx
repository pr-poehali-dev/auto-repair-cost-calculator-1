import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

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
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Рост экспорта российских товаров в страны БРИКС',
    description: 'По итогам третьего квартала экспорт российской продукции в страны БРИКС вырос на 23% по сравнению с аналогичным периодом прошлого года.',
    content: 'Детальный анализ показывает устойчивые тенденции роста торговых отношений...',
    author: 'Иван Петров',
    company: 'ООО "Экспорт Плюс"',
    date: '2024-03-15',
    category: 'economy',
    readTime: '5 мин'
  },
  {
    id: '2', 
    title: 'Новые возможности для малого и среднего бизнеса',
    description: 'Правительство анонсировало программу поддержки МСП с увеличенным размером субсидий и упрощенной процедурой получения.',
    content: 'Программа включает в себя несколько направлений поддержки...',
    author: 'Мария Сидорова',
    company: 'АО "Бизнес Консалтинг"',
    date: '2024-03-14',
    category: 'policy',
    readTime: '7 мин'
  },
  {
    id: '3',
    title: 'Цифровизация торговых площадок: тренды 2024',
    description: 'Исследование показывает, что 78% B2B компаний планируют увеличить инвестиции в цифровые торговые платформы.',
    content: 'Аналитики отмечают ключевые направления развития...',
    author: 'Алексей Волков',
    company: 'ПАО "ТехИнвест"',
    date: '2024-03-13',
    category: 'business',
    readTime: '4 мин'
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

const NewsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Экономические новости
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Актуальная информация о рынке, экономике и бизнесе от участников платформы
          </p>
          <Button 
            size="lg" 
            className="text-base font-semibold"
            onClick={() => navigate('/news/publish')}
          >
            <Icon name="PenSquare" size={18} className="mr-2" />
            Опубликовать новость
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNews.map((news) => (
            <Card key={news.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(news.category)}>
                    {getCategoryLabel(news.category)}
                  </Badge>
                  <span className="text-sm text-gray-500">{news.readTime}</span>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {news.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-3">
                <CardDescription className="text-gray-600 line-clamp-3 mb-4">
                  {news.description}
                </CardDescription>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="Building2" size={14} className="mr-1" />
                  <span className="mr-3">{news.company}</span>
                  <Icon name="Calendar" size={14} className="mr-1" />
                  <span>{new Date(news.date).toLocaleDateString('ru-RU')}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/news/${news.id}`)}
                >
                  <Icon name="ArrowRight" size={16} className="mr-2" />
                  Читать полностью
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/news')}
          >
            Все новости
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;