import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  status: 'new' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  priority: 'low' | 'medium' | 'high';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface BulkActions {
  selectedOrders: Set<string>;
  action: string;
}

interface OrderListProps {
  filteredOrders: Order[];
  bulkActions: BulkActions;
  handleBulkSelect: (orderId: string, checked: boolean) => void;
  handleSelectAll: () => void;
}

export default function OrderList({ 
  filteredOrders, 
  bulkActions, 
  handleBulkSelect, 
  handleSelectAll 
}: OrderListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'processing': return 'В обработке';
      case 'packed': return 'Упакован';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Заказы</CardTitle>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bulkActions.selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
              onChange={handleSelectAll}
              className="rounded"
            />
            <Label className="text-sm">Выбрать все</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={bulkActions.selectedOrders.has(order.id)}
                  onChange={(e) => handleBulkSelect(order.id, e.target.checked)}
                  className="mt-1 rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority === 'high' && '🔥'} 
                        {order.priority === 'medium' && '⚡'} 
                        {order.priority === 'low' && '📋'}
                        {order.priority === 'high' ? 'Срочно' : 
                         order.priority === 'medium' ? 'Средний' : 'Обычный'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{order.total.toLocaleString()} ₽</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Покупатель:</h4>
                      <p className="text-sm text-gray-700">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.phone}</p>
                      <p className="text-sm text-gray-600">{order.customer.email}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Товары:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                            <span className="text-sm text-gray-700">
                              {item.name} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Доставка:</h4>
                      <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-blue-600 mt-1">
                          Трек-номер: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="MessageSquare" size={14} className="mr-1" />
                        Чат
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon name="Phone" size={14} className="mr-1" />
                        Позвонить
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'new' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Icon name="Check" size={14} className="mr-1" />
                          Подтвердить
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Icon name="Package" size={14} className="mr-1" />
                          Упаковать
                        </Button>
                      )}
                      {order.status === 'packed' && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <Icon name="Truck" size={14} className="mr-1" />
                          Отправить
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Icon name="MoreHorizontal" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}