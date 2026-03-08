import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const SupplierStats = () => {
  const stats = [
    {
      title: 'Всего товаров',
      value: '24',
      change: '+3 за неделю',
      icon: 'Package',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Просмотры',
      value: '1,284',
      change: '+156 за неделю',
      icon: 'Eye',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Избранное',
      value: '89',
      change: '+12 за неделю',
      icon: 'Heart',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Запросы',
      value: '43',
      change: '+7 за неделю',
      icon: 'MessageSquare',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const topProducts = [
    { name: 'Электродвигатель АИР 250M4', views: 342, favorites: 28, requests: 15 },
    { name: 'Насос центробежный КМ 80-50-200', views: 298, favorites: 24, requests: 12 },
    { name: 'Редуктор червячный Ч-160', views: 256, favorites: 19, requests: 9 },
    { name: 'Подшипник 6310 2RS', views: 187, favorites: 15, requests: 6 },
    { name: 'Муфта упругая МУВП-5', views: 134, favorites: 11, requests: 4 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon name={stat.icon as any} size={20} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Топ товаров по просмотрам</CardTitle>
          <CardDescription>Самые популярные товары за последние 30 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="Eye" size={16} />
                    <span className="text-sm font-medium">{product.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="Heart" size={16} />
                    <span className="text-sm font-medium">{product.favorites}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="MessageSquare" size={16} />
                    <span className="text-sm font-medium">{product.requests}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierStats;
