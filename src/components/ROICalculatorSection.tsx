import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

const ROICalculatorSection = () => {
  const [monthlyOrders, setMonthlyOrders] = useState(100);
  const [averageOrderValue, setAverageOrderValue] = useState(50000);
  const [timePerOrder, setTimePerOrder] = useState(15);

  const calculateSavings = () => {
    const monthlySavingsHours = (monthlyOrders * timePerOrder * 0.6) / 60; // 60% экономия времени
    const costPerHour = 1000; // средняя стоимость часа менеджера
    const monthlySavings = monthlySavingsHours * costPerHour;
    const annualSavings = monthlySavings * 12;
    const revenueIncrease = monthlyOrders * averageOrderValue * 0.25; // 25% рост выручки
    const annualRevenueIncrease = revenueIncrease * 12;
    
    return {
      monthlySavings,
      annualSavings,
      monthlySavingsHours: Math.round(monthlySavingsHours),
      annualRevenueIncrease
    };
  };

  const savings = calculateSavings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Рассчитайте экономию для вашей компании
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Узнайте, сколько времени и денег вы сможете сэкономить, используя нашу платформу
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Калькулятор */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Icon name="Calculator" size={24} className="mr-3 text-blue-600" />
                Калькулятор ROI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly-orders" className="text-base font-medium">
                    Заказов в месяц
                  </Label>
                  <Input
                    id="monthly-orders"
                    type="number"
                    value={monthlyOrders}
                    onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                    className="mt-2 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="average-order" className="text-base font-medium">
                    Средняя сумма заказа (₽)
                  </Label>
                  <Input
                    id="average-order"
                    type="number"
                    value={averageOrderValue}
                    onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                    className="mt-2 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="time-per-order" className="text-base font-medium">
                    Время на обработку заказа (мин)
                  </Label>
                  <Input
                    id="time-per-order"
                    type="number"
                    value={timePerOrder}
                    onChange={(e) => setTimePerOrder(Number(e.target.value))}
                    className="mt-2 text-lg"
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-4">Ваша экономия:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Экономия времени</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {savings.monthlySavingsHours}ч/мес
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Экономия денег</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(savings.monthlySavings)}/мес
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Результаты */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Icon name="TrendingUp" size={32} className="text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">
                      {formatCurrency(savings.annualSavings)}
                    </h3>
                    <p className="text-green-700">Экономия в год</p>
                  </div>
                </div>
                <p className="text-green-800">
                  Автоматизация процессов сократит расходы на обработку заказов
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Icon name="DollarSign" size={32} className="text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">
                      {formatCurrency(savings.annualRevenueIncrease)}
                    </h3>
                    <p className="text-blue-700">Дополнительная выручка</p>
                  </div>
                </div>
                <p className="text-blue-800">
                  Увеличение скорости обработки заказов на 25%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Icon name="Clock" size={32} className="text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900">3 месяца</h3>
                    <p className="text-purple-700">Окупаемость</p>
                  </div>
                </div>
                <p className="text-purple-800">
                  Быстрый возврат инвестиций за счет автоматизации
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-4">
                <Icon name="Rocket" size={20} className="mr-2" />
                Получить персональный расчет
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculatorSection;