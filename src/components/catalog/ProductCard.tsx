import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

import ProductBadges from "@/components/product/ProductBadges";
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: number;
  name: string;
  image: string;
  images?: string[];
  category: string;
  seller: string;
  verified: boolean;
  price: number;
  oldPrice?: number;
  unit: string;
  minOrder: string;
  available: string;


  inStock: boolean;
  discount?: number;
  description: string;
  detailedDescription?: string;
  fastDelivery?: boolean;
  region?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onSendInquiry: (product: Product) => void;
  onProductClick?: (productId: number) => void;
}

const ProductCard = ({
  product,
  viewMode,
  onSendInquiry,
  onProductClick
}: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Товар добавлен в корзину",
      description: product.name,
    });
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Удалено из избранного" : "Добавлено в избранное",
      description: product.name,
    });
  };

  return (
    <Card 
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer ${
        viewMode === 'list' ? 'flex flex-row h-48' : 'flex flex-col min-h-[600px]'
      }`}
      data-product-card
      onClick={() => onProductClick?.(product.id)}
    >
      <div className={`relative overflow-hidden ${
        viewMode === 'list' ? 'w-64 h-48' : 'aspect-video'
      }`}>
        <img 
          src={images[currentImageIndex]} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Кнопки листания фото */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevImage}
            >
              <Icon name="ChevronLeft" size={18} className="text-gray-700" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNextImage}
            >
              <Icon name="ChevronRight" size={18} className="text-gray-700" />
            </Button>
            
            {/* Индикаторы */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-white/95 text-gray-700 text-xs">
            {product.category}
          </Badge>
          {product.discount && (
            <Badge variant="destructive" className="text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Нет в наличии
            </Badge>
          </div>
        )}


      </div>
      
      <CardContent className={`p-5 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div className="space-y-3 flex-1">
          {/* Название товара */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#0d5e3c] transition-colors">
            {product.name}
          </h3>
          
          {/* Продавец */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="Store" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{product.seller}</span>
            </div>
            {product.verified && (
              <div className="flex items-center gap-1 ml-6">
                <Badge variant="outline" className="text-xs h-5 border-green-200 text-green-700 px-1.5 py-0.5">
                  <Icon name="CheckCircle" size={8} className="mr-0.5" />
                  <span className="text-[10px] font-medium">Верифицирован</span>
                </Badge>
              </div>
            )}
            {product.region && (
              <div className="flex items-center gap-2 ml-6">
                <Icon name="Truck" size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">Доставка из г. {product.region}</span>
              </div>
            )}
          </div>



          {/* Описание (только в режиме списка) */}
          {viewMode === 'list' && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          <div className="border-t pt-3">
            {/* Цена */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-[#0d5e3c]">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-sm text-gray-500">{product.unit}</span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.oldPrice.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>
            
            {/* Информация о заказе */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Icon name="Package" size={12} className="text-gray-400" />
                <span>Мин: {product.minOrder}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Truck" size={12} className="text-gray-400" />
                <span>{product.available}</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Кнопки действий - всегда внизу */}
        <div className="space-y-2 pt-2 mt-auto">
            <Button 
              className="w-full bg-[#0d5e3c] hover:bg-[#0a4a2f] text-white font-medium py-2 px-3 text-sm h-9"
              onClick={(e) => {
                e.stopPropagation();
                onSendInquiry(product);
              }}
              disabled={!product.inStock}
            >
              <div className="flex items-center justify-center gap-1.5 w-full min-w-0">
                <Icon name="Mail" size={14} className="shrink-0" />
                <span className="truncate">Отправить заявку</span>
              </div>
            </Button>
            
            {/* Дополнительные действия */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleToggleLike}
              >
                <Icon 
                  name="Heart" 
                  size={14} 
                  className={`mr-1 ${isLiked ? 'text-red-500 fill-red-500' : ''}`}
                />
                Нравится
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <Icon name="ShoppingCart" size={14} className="mr-1" />
                В корзину
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;