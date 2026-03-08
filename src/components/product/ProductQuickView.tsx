import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

import ProductBadges from './ProductBadges';

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
}

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: number, quantity: number) => void;
}

export default function ProductQuickView({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}: ProductQuickViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const images = [
    product.main_image_url,
    ...(product.gallery_images || [])
  ].filter(Boolean);

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - product.discount_percentage! / 100)
    : product.price;

  const isNew = () => {
    const createdDate = new Date(product.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Изображения */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Нет+фото';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="Image" size={48} className="text-gray-400" />
                </div>
              )}
              
              <div className="absolute top-3 left-3">
                <ProductBadges
                  isNew={isNew()}
                  isBestseller={false}
                  hasDiscount={hasDiscount}
                  discountPercentage={product.discount_percentage}
                  isFeatured={product.is_featured}
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=Нет';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="space-y-4">


            {/* Цена */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {discountedPrice.toLocaleString()} {product.currency}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    {product.price.toLocaleString()} {product.currency}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="text-sm text-green-600 font-medium">
                  Экономия: {(product.price - discountedPrice).toLocaleString()} {product.currency}
                </div>
              )}
            </div>

            {/* Описание */}
            {product.short_description && (
              <p className="text-gray-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Поставщик */}
            {product.supplier_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Store" size={16} />
                <span>Продавец: {product.supplier_name}</span>
              </div>
            )}

            {/* Наличие */}
            <div className="flex items-center gap-2">
              <Icon 
                name={product.stock_quantity > 0 ? "CheckCircle" : "XCircle"} 
                size={16} 
                className={product.stock_quantity > 0 ? "text-green-500" : "text-red-500"} 
              />
              <span className={`text-sm ${
                product.stock_quantity > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {product.stock_quantity > 0 
                  ? `В наличии: ${product.stock_quantity} шт.`
                  : 'Нет в наличии'
                }
              </span>
            </div>

            {/* Количество и добавление в корзину */}
            {product.stock_quantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Количество:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      <Icon name="Minus" size={16} />
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Добавить в корзину
                  </Button>
                  <Button variant="outline" size="icon">
                    <Icon name="Heart" size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Быстрые действия */}
            <div className="pt-4 border-t">
              <div className="flex gap-2 text-sm">
                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                  <Icon name="Share2" size={14} />
                  Поделиться
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                  <Icon name="BarChart3" size={14} />
                  Сравнить
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}