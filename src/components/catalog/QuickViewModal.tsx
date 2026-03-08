import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Product } from "./ProductCard";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSendInquiry: (product: Product) => void;
}

const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onSendInquiry,
}: QuickViewModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white rounded-2xl overflow-hidden">
        {/* Закрыть кнопка */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
        >
          <Icon name="X" size={16} className="text-gray-600" />
        </button>

        {/* Изображение во всю ширину */}
        <div className="relative h-48 bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Статусы */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.discount && (
              <Badge variant="destructive" className="text-xs font-medium">
                -{product.discount}%
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="bg-gray-900/80 text-white text-xs">
                Нет в наличии
              </Badge>
            )}
          </div>


        </div>

        {/* Контент */}
        <div className="p-4 space-y-3">
          {/* Название и цена */}
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                {product.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {product.oldPrice.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">за {product.unit}</span>
            </div>
          </div>

          {/* Ключевые факты в виде тегов */}
          <div className="flex flex-wrap gap-2">


            {product.verified && (
              <div className="flex items-center gap-1 bg-green-50 rounded-full px-2 py-1">
                <Icon name="CheckCircle" size={12} className="text-green-600" />
                <span className="text-xs text-green-700">Верифицирован</span>
              </div>
            )}

            <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-1">
              <Icon name="Package" size={12} className="text-blue-600" />
              <span className="text-xs text-blue-700">от {product.minOrder}</span>
            </div>
          </div>

          {/* Продавец */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Icon name="Store" size={12} />
            <span className="truncate">{product.seller}</span>
          </div>

          {/* Основное действие */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium"
            onClick={() => {
              onSendInquiry(product);
              onClose();
            }}
            disabled={!product.inStock}
          >
            <Icon name="Zap" size={16} className="mr-2" />
            {product.inStock ? 'Быстрая заявка' : 'Товар недоступен'}
          </Button>

          {/* Дополнительная информация */}
          <div className="text-center">
            <button 
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Посмотреть полную информацию →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;