import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';

const NewsPublish = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    company: '',
    author: '',
    readTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки новости
    console.log('Новость опубликована:', formData);
    // Перенаправляем на главную страницу
    navigate('/');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    { value: 'economy', label: 'Экономика' },
    { value: 'market', label: 'Рынок' },
    { value: 'business', label: 'Бизнес' },
    { value: 'policy', label: 'Политика' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад к новостям
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Опубликовать новость
            </h1>
            <p className="text-lg text-gray-600">
              Поделитесь актуальной информацией о вашем бизнесе или рынке
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="PenSquare" size={20} className="mr-2" />
                Создание новости
              </CardTitle>
              <CardDescription>
                Заполните форму для публикации экономической новости на платформе
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="author" className="text-sm font-medium text-gray-700">
                      Автор
                    </label>
                    <Input
                      id="author"
                      placeholder="Ваше имя"
                      value={formData.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Компания
                    </label>
                    <Input
                      id="company"
                      placeholder="Название компании"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Заголовок новости
                  </label>
                  <Input
                    id="title"
                    placeholder="Введите заголовок новости"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Категория
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
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
                    <label htmlFor="readTime" className="text-sm font-medium text-gray-700">
                      Время чтения
                    </label>
                    <Input
                      id="readTime"
                      placeholder="5 мин"
                      value={formData.readTime}
                      onChange={(e) => handleChange('readTime', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Краткое описание
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание новости (до 200 символов)"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/200 символов
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Полный текст новости
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Введите полный текст новости..."
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={10}
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-sm font-medium text-blue-900 mb-2">
                    <Icon name="Info" size={16} className="mr-2" />
                    Предварительный просмотр категории
                  </h3>
                  {formData.category && (
                    <Badge className={
                      formData.category === 'economy' ? 'bg-blue-100 text-blue-800' :
                      formData.category === 'market' ? 'bg-green-100 text-green-800' :
                      formData.category === 'business' ? 'bg-purple-100 text-purple-800' :
                      formData.category === 'policy' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {categories.find(cat => cat.value === formData.category)?.label}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    <Icon name="Send" size={16} className="mr-2" />
                    Опубликовать новость
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsPublish;