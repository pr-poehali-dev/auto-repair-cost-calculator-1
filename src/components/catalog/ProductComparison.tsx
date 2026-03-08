import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { Product } from "./ProductCard";

interface ProductComparisonProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
  onSendInquiry: (product: Product) => void;
}

const ProductComparison = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onSendInquiry
}: ProductComparisonProps) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Сравнение товаров</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Icon name="BarChart" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Добавьте товары для сравнения</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const comparisonAttributes = [
    { key: 'price', label: 'Цена', format: (value: any) => `${value.toLocaleString('ru-RU')} ₽` },

    { key: 'category', label: 'Категория', format: (value: any) => value },
    { key: 'seller', label: 'Продавец', format: (value: any) => value },
    { key: 'minOrder', label: 'Мин. заказ', format: (value: any) => value },
    { key: 'available', label: 'В наличии', format: (value: any) => value },
    { key: 'inStock', label: 'Наличие', format: (value: any) => value ? 'В наличии' : 'Нет в наличии' }
  ];

  const getBestValue = (attribute: string, products: Product[]) => {
    if (attribute === 'price') {
      return Math.min(...products.map(p => p.price));
    }

    return null;
  };

  const isHighlighted = (attribute: string, value: any, products: Product[]) => {
    const bestValue = getBestValue(attribute, products);
    return bestValue !== null && value === bestValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Icon name="BarChart" size={20} className="mr-2 text-blue-600" />
              Сравнение товаров ({products.length})
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Карточки товаров */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <Icon name="X" size={14} />
                </Button>

                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-white/95 text-gray-700 text-xs">
                      {product.category}
                    </Badge>
                    {product.discount && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-bold ${isHighlighted('price', product.price, products) ? 'text-green-600' : 'text-blue-600'}`}>
                        {product.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-xs text-gray-500">{product.unit}</span>
                    </div>
                    


                    <Button 
                      size="sm" 
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={() => onSendInquiry(product)}
                      disabled={!product.inStock}
                    >
                      <Icon name="Mail" size={14} className="mr-1" />
                      Заявка
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Детальная таблица сравнения */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Подробное сравнение</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Характеристика</th>
                      {products.map((product) => (
                        <th key={product.id} className="text-left py-3 px-2 font-semibold min-w-[200px]">
                          <div className="line-clamp-2">{product.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonAttributes.map((attr) => (
                      <tr 
                        key={attr.key} 
                        className={`border-b hover:bg-gray-50 ${selectedAttribute === attr.key ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedAttribute(selectedAttribute === attr.key ? null : attr.key)}
                      >
                        <td className="py-3 px-2 font-medium text-gray-700 cursor-pointer">
                          {attr.label}
                        </td>
                        {products.map((product) => {
                          const value = product[attr.key as keyof Product];
                          const isHighlight = isHighlighted(attr.key, value, products);
                          
                          return (
                            <td 
                              key={product.id} 
                              className={`py-3 px-2 ${isHighlight ? 'font-bold text-green-600' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                {attr.format(value)}
                                {attr.key === 'seller' && product.verified && (
                                  <Icon name="CheckCircle" size={12} className="text-green-600" />
                                )}
                                {attr.key === 'inStock' && !product.inStock && (
                                  <Icon name="AlertCircle" size={12} className="text-red-500" />
                                )}
                                {isHighlight && (
                                  <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                    Лучшее
                                  </Badge>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Действия */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 Кликните по характеристике для выделения
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => products.forEach(p => onRemoveProduct(p.id))}>
                Очистить все
              </Button>
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Закрыть сравнение
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductComparison;