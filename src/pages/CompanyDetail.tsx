import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded: string;
  employees: string;
  categories: string[];

  verified: boolean;
  certifications: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  description: string;
}

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Моковые данные компании
  const company: Company = {
    id: id || '1',
    name: 'ООО «СтиллЛифт»',
    logo: localStorage.getItem('companyLogo') || '/api/placeholder/120/120',
    description: 'Ведущий поставщик подъемного оборудования и технических решений для промышленности. Более 15 лет опыта на рынке.',
    address: 'г. Москва, ул. Промышленная, д. 45, стр. 2',
    phone: '+7 (495) 123-45-67',
    email: 'info@stilllift.ru',
    website: 'www.stilllift.ru',
    founded: '2008',
    employees: '50-100',
    categories: ['Подъемное оборудование', 'Краны', 'Лебедки', 'Запчасти'],

    verified: true,
    certifications: ['ISO 9001', 'ГОСТ Р', 'СРО']
  };

  // Моковые данные товаров компании
  const companyProducts: Product[] = [
    {
      id: '1',
      name: 'Кран мостовой электрический',
      price: 2850000,
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      category: 'Краны',
      inStock: true,
      description: 'Электрический мостовой кран грузоподъемностью 10 тонн'
    },
    {
      id: '2',
      name: 'Лебедка электрическая 5т',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
      category: 'Лебедки',
      inStock: true,
      description: 'Электрическая лебедка грузоподъемностью 5 тонн'
    },
    {
      id: '3',
      name: 'Таль электрическая 2т',
      price: 95000,
      image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop',
      category: 'Подъемное оборудование',
      inStock: true,
      description: 'Электрическая таль грузоподъемностью 2 тонны'
    },
    {
      id: '4',
      name: 'Кран козловой',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400&h=300&fit=crop',
      category: 'Краны',
      inStock: false,
      description: 'Козловой кран для открытых площадок'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all' 
    ? companyProducts 
    : companyProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <div className="container mx-auto px-6 py-8">
          
          {/* Кнопка назад */}
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          
          {/* Информация о компании */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="w-24 h-24 rounded-lg object-cover border"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Icon name="CheckCircle" size={14} className="mr-1" />
                        Проверено
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    
                    <div className="flex gap-2">
                      {company.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{company.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={16} className="text-gray-500" />
                      <span>{company.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Phone" size={16} className="text-gray-500" />
                      <span>{company.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Mail" size={16} className="text-gray-500" />
                      <span>{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Globe" size={16} className="text-gray-500" />
                      <span>{company.website}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} className="text-gray-500" />
                      <span>Основана в {company.founded} году</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Табы */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Товары ({companyProducts.length})</TabsTrigger>
              <TabsTrigger value="about">О компании</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {/* Фильтр по категориям */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Все товары
                    </Button>
                    {company.categories.map(category => (
                      <Button 
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Список товаров */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'В наличии' : 'Под заказ'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <p className="text-lg font-bold text-green-600">
                          {product.price.toLocaleString()} ₽
                        </p>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Icon name="ShoppingCart" size={14} className="mr-1" />
                            В корзину
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icon name="Eye" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>О компании</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    {company.description} Компания специализируется на поставке и обслуживании подъемного оборудования для различных отраслей промышленности.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Основные направления:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Мостовые краны</li>
                        <li>• Козловые краны</li>
                        <li>• Электрические лебедки</li>
                        <li>• Подъемные тали</li>
                        <li>• Запчасти и комплектующие</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Сертификаты:</h4>
                      <div className="flex flex-wrap gap-2">
                        {company.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;