import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  image?: string;
  category: string;
  seller: string;
  price: number;
  unit: string;
  minOrder: string;
}

interface ProductInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductInquiryModal = ({ isOpen, onClose, product }: ProductInquiryModalProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [inquiryData, setInquiryData] = useState({
    companyName: 'ООО "Торговый дом"',
    contactName: 'Иван Иванов',
    email: 'ivan@company.ru',
    phone: '+7 (999) 123-45-67',
    quantity: '',
    message: '',
    includeInCart: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Симуляция отправки заявки на email
      const inquiryEmail = {
        to: inquiryData.email,
        subject: `Заявка на товар: ${product.name}`,
        body: `
Новая заявка на товар

ТОВАР:
Название: ${product.name}
Категория: ${product.category}
Поставщик: ${product.seller}
Цена: ${product.price.toLocaleString('ru-RU')} ₽ ${product.unit}
Минимальный заказ: ${product.minOrder}

ЗАЯВКА:
Компания: ${inquiryData.companyName}
Контактное лицо: ${inquiryData.contactName}
Email: ${inquiryData.email}
Телефон: ${inquiryData.phone}
Количество: ${inquiryData.quantity || 'Не указано'}
Сообщение: ${inquiryData.message || 'Не указано'}

Дата заявки: ${new Date().toLocaleString('ru-RU')}
        `
      };

      // Здесь должна быть реальная отправка email
      console.log('Отправка заявки на email:', inquiryEmail);

      // Добавляем товар в корзину, если выбрана опция
      if (inquiryData.includeInCart) {
        addItem({
          id: product.id.toString(),
          title: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          company: product.seller
        });
      }

      // Показываем сообщение об успехе
      alert(`Заявка отправлена на ${inquiryData.email}!\n\n${inquiryData.includeInCart ? 'Товар также добавлен в корзину.' : ''}\n\nМенеджер свяжется с вами в ближайшее время.`);

      onClose();
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error);
      alert('Произошла ошибка при отправке заявки. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Mail" size={20} />
            Отправить заявку
          </DialogTitle>
          <DialogDescription>
            Отправьте заявку на товар и получите персональное коммерческое предложение
          </DialogDescription>
        </DialogHeader>

        {/* Информация о товаре */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span 
                    className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      onClose();
                      navigate('/company/1');
                    }}
                  >
                    <Icon name="Building2" size={14} />
                    {product.seller}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Tag" size={14} />
                    {product.category}
                  </span>
                </div>
                <div className="text-lg font-bold text-primary">
                  {product.price.toLocaleString('ru-RU')} ₽ {product.unit}
                </div>
                <div className="text-sm text-gray-600">
                  Мин. заказ: {product.minOrder}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Компания *</Label>
              <Input
                id="companyName"
                value={inquiryData.companyName}
                onChange={(e) => setInquiryData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Контактное лицо *</Label>
              <Input
                id="contactName"
                value={inquiryData.contactName}
                onChange={(e) => setInquiryData(prev => ({ ...prev, contactName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Корпоративный email *</Label>
              <Input
                id="email"
                type="email"
                value={inquiryData.email}
                onChange={(e) => setInquiryData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="company@domain.ru"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={inquiryData.phone}
                onChange={(e) => setInquiryData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+7 (xxx) xxx-xx-xx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Желаемое количество</Label>
              <Input
                id="quantity"
                value={inquiryData.quantity}
                onChange={(e) => setInquiryData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Укажите количество"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Дополнительная информация</Label>
            <Textarea
              id="message"
              value={inquiryData.message}
              onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Укажите дополнительные требования, условия поставки, сроки..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="includeInCart"
              checked={inquiryData.includeInCart}
              onChange={(e) => setInquiryData(prev => ({ ...prev, includeInCart: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="includeInCart" className="text-sm">
              Также добавить товар в корзину для удобства
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отправляем...
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить заявку
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center">
          Заявка будет отправлена на указанный email.<br />
          Менеджер свяжется с вами в течение рабочего дня.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInquiryModal;