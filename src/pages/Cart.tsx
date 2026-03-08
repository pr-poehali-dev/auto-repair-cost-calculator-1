import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [orderComment, setOrderComment] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: 'Иван Иванов',
    phone: '+7 (999) 123-45-67',
    email: 'ivan@company.ru',
    company: 'ООО "Торговый дом"'
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleCreateOrder = () => {
    if (items.length === 0) return;
    
    console.log('Создание заказа:', {
      items,
      totalPrice: getTotalPrice(),
      contactInfo,
      comment: orderComment
    });
    
    alert('Заказ успешно создан! Менеджер свяжется с вами в ближайшее время.');
    clearCart();
    navigate('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="ml-56 transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8">
            <Card className="text-center py-12">
              <CardContent>
                <Icon name="ShoppingCart" size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Корзина пуста
                </h2>
                <p className="text-gray-600 mb-6">
                  Добавьте товары из каталога, чтобы создать заказ
                </p>
                <Button size="lg" onClick={() => navigate('/catalog')}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Перейти в каталог
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Корзина
                </h1>
                <p className="text-lg text-gray-600">
                  {items.length} товаров на сумму {getTotalPrice().toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/catalog')}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить еще товары
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Icon name="Building2" size={14} />
                              <span>{item.company}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Icon name="Minus" size={14} />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Icon name="Plus" size={14} />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.price.toLocaleString('ru-RU')} ₽ за единицу
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Очистить корзину
                </Button>
                <div className="text-lg">
                  <span className="text-gray-600">Итого: </span>
                  <span className="font-bold text-xl text-primary">
                    {getTotalPrice().toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Оформление заказа</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Контактное лицо
                      </label>
                      <Input
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ФИО"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Телефон
                      </label>
                      <Input
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Номер телефона"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Email
                      </label>
                      <Input
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Электронная почта"
                        type="email"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Компания
                      </label>
                      <Input
                        value={contactInfo.company}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Название компании"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Комментарий к заказу
                      </label>
                      <Textarea
                        value={orderComment}
                        onChange={(e) => setOrderComment(e.target.value)}
                        placeholder="Дополнительные требования, условия доставки..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Товаров:</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                      <span>Итого:</span>
                      <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      *Точная стоимость с учетом доставки будет рассчитана менеджером
                    </p>
                  </div>

                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={handleCreateOrder}
                    disabled={!contactInfo.name || !contactInfo.phone}
                  >
                    <Icon name="ShoppingBag" size={16} className="mr-2" />
                    Оформить заказ
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Нажимая кнопку, вы соглашаетесь с{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        условиями обработки данных
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;