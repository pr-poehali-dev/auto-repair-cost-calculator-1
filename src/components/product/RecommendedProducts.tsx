import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

import ProductBadges from './ProductBadges';
import ProductQuickView from './ProductQuickView';

interface Product {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  currency: string;
  discount_percentage?: number;
  main_image_url?: string;
  gallery_images?: string[];
  stock_quantity: number;
  supplier_name?: string;


  is_featured?: boolean;
  created_at: string;
  category_name?: string;
}

interface RecommendedProductsProps {
  title?: string;
  currentProductId?: number;
  categoryId?: number;
  limit?: number;
  className?: string;
}

export default function RecommendedProducts({ 
  title = "Рекомендуем также",
  currentProductId,
  categoryId,
  limit = 4,
  className = ""
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchRecommendedProducts();
  }, [currentProductId, categoryId]);

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      
      // Получаем рекомендованные товары
      const url = 'https://functions.poehali.dev/8fe277e5-ff21-4acb-a688-5dae6eb30c39';
      const params = new URLSearchParams({
        status: 'active',
        limit: (limit * 2).toString() // Загружаем больше для фильтрации
      });

      if (categoryId) {
        params.append('category_id', categoryId.toString());
      }

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      let filteredProducts = data.products || [];

      // Исключаем текущий товар
      if (currentProductId) {
        filteredProducts = filteredProducts.filter((p: Product) => p.id !== currentProductId);
      }

      // Сортируем по релевантности (рейтинг, избранное, новизна)
      filteredProducts.sort((a: Product, b: Product) => {
        // Приоритет для избранных
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;



        // По дате создания (новые первыми)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Добавляем моковые данные для демонстрации
      const enhancedProducts = filteredProducts.slice(0, limit).map((product: Product) => ({
        ...product,

        supplier_name: product.supplier_name || 'ООО "Поставщик"'
      }));

      setProducts(enhancedProducts);
    } catch (error) {
      console.error('Failed to fetch recommended products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleAddToCart = (productId: number, quantity: number) => {
    console.log(`Adding product ${productId} to cart with quantity ${quantity}`);
    // Здесь будет интеграция с корзиной
  };

  const isNew = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    return discount ? price * (1 - discount / 100) : price;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={20} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Нет+фото';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Image" size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Бейджи */}
                  <div className="absolute top-2 left-2">
                    <ProductBadges
                      isNew={isNew(product.created_at)}
                      isBestseller={false}
                      hasDiscount={!!product.discount_percentage}
                      discountPercentage={product.discount_percentage}
                      isFeatured={product.is_featured}
                    />
                  </div>

                  {/* Быстрые действия */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(product);
                        }}
                      >
                        <Icon name="Eye" size={14} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="Heart" size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Быстрое добавление в корзину */}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.id, 1);
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      <Icon name="ShoppingCart" size={14} className="mr-1" />
                      {product.stock_quantity > 0 ? 'В корзину' : 'Нет в наличии'}
                    </Button>
                  </div>
                </div>

                {/* Информация о товаре */}
                <div className="space-y-2">


                  {/* Название */}
                  <h3 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Категория */}
                  {product.category_name && (
                    <p className="text-xs text-gray-500">
                      {product.category_name}
                    </p>
                  )}

                  {/* Цена */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {calculateDiscountedPrice(product.price, product.discount_percentage).toLocaleString()} {product.currency}
                    </span>
                    {product.discount_percentage && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Поставщик */}
                  <p className="text-xs text-gray-500">
                    {product.supplier_name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Кнопка "Показать все" */}
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => window.location.href = '/catalog'}>
              Посмотреть все товары
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Быстрый просмотр */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}