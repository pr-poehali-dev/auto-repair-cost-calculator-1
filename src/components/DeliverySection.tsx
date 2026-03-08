import DeliveryCalculator from "./DeliveryCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const DeliverySection = () => {
  return (
    <section id="delivery" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Доставка</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Надежная доставка по всей России с прозрачным расчетом стоимости
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Truck" size={20} />
                  Способы доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="Clock" size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Экспресс доставка</h4>
                    <p className="text-sm text-gray-600">1-2 дня, курьером до двери</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Package" size={20} className="text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Стандартная доставка</h4>
                    <p className="text-sm text-gray-600">3-5 дней, транспортной компанией</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={20} className="text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Экономная доставка</h4>
                    <p className="text-sm text-gray-600">5-10 дней, до пункта выдачи</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={20} />
                  Гарантии
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Страхование груза включено</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Отслеживание в реальном времени</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Компенсация при повреждении</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <DeliveryCalculator />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;