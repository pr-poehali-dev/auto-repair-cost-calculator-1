import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const BusinessHeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 py-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Левая часть - текст */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Icon name="Zap" size={16} className="mr-2" />
                №1 платформа для B2B торговли
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Управляйте <br />
                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  бизнесом
                </span> <br />
                эффективно
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Комплексная платформа для автоматизации закупок, продаж и управления поставщиками. 
                Более 10,000 компаний уже оптимизировали свой бизнес с нашей помощью.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Icon name="Rocket" size={20} className="mr-2" />
                Начать бесплатно
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Icon name="Play" size={20} className="mr-2" />
                Смотреть демо
              </Button>
            </div>
            
            {/* Статистика */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Активных компаний</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">₽2.5Б</div>
                <div className="text-sm text-gray-600">Оборот в месяц</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Время работы</div>
              </div>
            </div>
          </div>
          
          {/* Правая часть - визуал */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
              {/* Мокап интерфейса */}
              <div className="space-y-4">
                {/* Заголовок панели */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="font-semibold text-gray-900">Панель управления</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Метрики */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Заказы</p>
                        <p className="text-2xl font-bold text-blue-900">147</p>
                      </div>
                      <Icon name="ShoppingBag" size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-teal-600">Выручка</p>
                        <p className="text-2xl font-bold text-teal-900">₽2.4М</p>
                      </div>
                      <Icon name="TrendingUp" size={24} className="text-teal-600" />
                    </div>
                  </div>
                </div>
                
                {/* График */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Рост продаж</p>
                  <div className="flex items-end space-x-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, index) => (
                      <div 
                        key={index}
                        className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t flex-1"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Последние заказы */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">Последние заказы</p>
                  {[
                    { company: "ООО «ТехСтрой»", amount: "₽185,000", status: "processing" },
                    { company: "ИП Иванов С.А.", amount: "₽92,500", status: "completed" },
                    { company: "АО «МегаСнаб»", amount: "₽310,000", status: "pending" }
                  ].map((order, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Icon name="Building2" size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.company}</p>
                          <p className="text-xs text-gray-500">{order.amount}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'completed' ? 'Выполнен' :
                         order.status === 'processing' ? 'В работе' : 'Ожидает'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Декоративные элементы */}
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-gradient-to-r from-blue-200 to-teal-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-r from-teal-200 to-blue-200 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessHeroSection;