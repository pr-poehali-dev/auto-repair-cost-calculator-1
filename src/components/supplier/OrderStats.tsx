import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OrderStatsProps {
  orderStats: {
    new: number;
    processing: number;
    shipped: number;
    total: number;
  };
}

export default function OrderStats({ orderStats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Новые заказы</p>
              <p className="text-2xl font-bold text-blue-600">{orderStats.new}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon name="ShoppingCart" size={20} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">В обработке</p>
              <p className="text-2xl font-bold text-yellow-600">{orderStats.processing}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Icon name="Clock" size={20} className="text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Отправлено</p>
              <p className="text-2xl font-bold text-orange-600">{orderStats.shipped}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Icon name="Truck" size={20} className="text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Icon name="Package" size={20} className="text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}