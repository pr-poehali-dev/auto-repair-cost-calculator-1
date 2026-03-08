import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const ProductsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const products = [
    {
      id: 1,
      name: "Труба стальная 108x4 ГОСТ 8732",
      image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
      category: "Металлопрокат",
      seller: "ООО «Металл-Трейд»",
      verified: true,
      price: "45,600",
      unit: "за тонну",
      minOrder: "5 тонн",
      available: "120 тонн",

    },
    {
      id: 2,
      name: "Цемент ПЦ 400-Д20 навалом",
      image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
      category: "Стройматериалы",
      seller: "АО «СтройБаза Регион»",
      verified: true,
      price: "3,850",
      unit: "за тонну",
      minOrder: "20 тонн",
      available: "500+ тонн",

    },
    {
      id: 3,
      name: "Платы Arduino Uno R3 (партия)",
      image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
      category: "Электроника",
      seller: "ИП Электроника-Опт",
      verified: false,
      price: "890",
      unit: "за штуку",
      minOrder: "100 шт",
      available: "2,000 шт",
      rating: 4.6
    },
    {
      id: 4,
      name: "Профнастил С8 оцинкованный",
      image: "/img/764d08a6-7946-4b1d-9c27-48e192211cc0.jpg",
      category: "Стройматериалы",
      seller: "ООО «Кровля-Проф»",
      verified: true,
      price: "485",
      unit: "за м²",
      minOrder: "200 м²",
      available: "5,000+ м²",

    },
    {
      id: 5,
      name: "Упаковка картонная 300x200x100",
      image: "/img/d166a943-2618-4918-b162-2f653f5ae829.jpg",
      category: "Упаковка",
      seller: "ООО «Пак-Сервис»",
      verified: true,
      price: "18.50",
      unit: "за штуку",
      minOrder: "1,000 шт",
      available: "50,000+ шт",
      rating: 4.5
    },
    {
      id: 6,
      name: "Кабель ВВГ 3x2.5 (бухта 100м)",
      image: "/img/eb347072-5079-42a8-9320-9ff8ccc544f5.jpg",
      category: "Электротехника",
      seller: "АО «КабельСнаб»",
      verified: true,
      price: "2,340",
      unit: "за бухту",
      minOrder: "10 бухт",
      available: "200+ бухт",

    }
  ];

  const suppliers = [
    {
      name: "ООО \"Промышленные решения\"",
      verified: true,
      category: "Металлургия",
      products: "150+ товаров",

    },
    {
      name: "АО \"СтройМатериалы Регион\"",
      verified: true,
      category: "Строительство",
      products: "320+ товаров",

    },
    {
      name: "ИП Петров А.В.\"",
      verified: false,
      category: "Продукты питания",
      products: "85+ товаров",
      rating: 4.6
    }
  ];

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesVerified = !verifiedOnly || product.verified;
    
    let matchesPrice = true;
    if (priceFilter !== "all") {
      const price = parseFloat(product.price.replace(",", ""));
      switch (priceFilter) {
        case "low":
          matchesPrice = price < 1000;
          break;
        case "medium":
          matchesPrice = price >= 1000 && price < 10000;
          break;
        case "high":
          matchesPrice = price >= 10000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesVerified && matchesPrice;
  });

  // Получить уникальные категории
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <>
      {/* Suppliers Section */}
      <section id="suppliers" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Верифицированные поставщики
              </h2>
              <p className="text-lg text-gray-600">
                Каждый поставщик проходит тщательную проверку документов, лицензий и 
                деловой репутации. Работайте только с надежными партнерами.
              </p>
              
              <div className="space-y-4">
                {suppliers.map((supplier, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{supplier.name}</h4>
                          {supplier.verified && (
                            <Badge variant="default" className="text-xs">
                              <Icon name="CheckCircle" size={12} className="mr-1" />
                              Верифицирован
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{supplier.category} • {supplier.products}</p>

                      </div>
                      <Button variant="outline" size="sm">
                        Связаться
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Button size="lg" className="w-full">
                <Icon name="Users" size={18} className="mr-2" />
                Посмотреть всех поставщиков
              </Button>
            </div>

            <div className="relative">
              <img 
                src="/img/559113ab-05d9-4e39-9c9c-dcbdbe63e35b.jpg" 
                alt="Склад и логистика"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Популярные товары
            </h2>
            <p className="text-lg text-gray-600">
              Актуальные предложения от верифицированных поставщиков с лучшими ценами
            </p>
          </div>

          {/* Фильтры товаров */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Filter" size={20} className="mr-2" />
                Фильтры каталога
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Поиск товара</label>
                  <Input
                    placeholder="Введите название товара..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Категория</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ценовой диапазон</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любая цена" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любая цена</SelectItem>
                      <SelectItem value="low">До 1,000 ₽</SelectItem>
                      <SelectItem value="medium">1,000 - 10,000 ₽</SelectItem>
                      <SelectItem value="high">Свыше 10,000 ₽</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Дополнительно</label>
                  <Button
                    variant={verifiedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className="w-full"
                  >
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    {verifiedOnly ? "Только верифицированные" : "Все поставщики"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 hover:bg-white/90">
                    {product.category}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      
                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Store" size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 flex-1">{product.seller}</span>
                        {product.verified && (
                          <Badge variant="default" className="text-xs h-5">
                            <Icon name="CheckCircle" size={10} className="mr-1" />
                            Верифицирован
                          </Badge>
                        )}
                      </div>


                    </div>

                    {/* Price */}
                    <div className="border-t pt-4">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold text-primary">
                          {product.price} ₽
                        </span>
                        <span className="text-sm text-gray-500">{product.unit}</span>
                      </div>
                      
                      {/* Order Info */}
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon name="Package" size={12} />
                          <span>Минимальный заказ: {product.minOrder}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Truck" size={12} />
                          <span>В наличии: {product.available}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-3 text-sm h-9">
                        <div className="flex items-center justify-center gap-1.5 w-full min-w-0">
                          <Icon name="ShoppingCart" size={14} className="shrink-0" />
                          <span className="truncate">В корзину</span>
                        </div>
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-gray-200 hover:border-red-300">
                        <Icon name="Heart" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="text-center py-12 mt-8">
              <CardContent>
                <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Товары не найдены</h3>
                <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setPriceFilter("all");
                    setVerifiedOnly(false);
                  }}
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-8">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Посмотреть весь каталог ({filteredProducts.length} из {products.length})
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsSection;