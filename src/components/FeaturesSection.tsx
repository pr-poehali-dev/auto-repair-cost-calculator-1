import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const FeaturesSection = () => {
  const features = [
    {
      icon: "Shield",
      title: "Комплаенс и безопасность",
      description: "Многоступенчатая верификация контрагентов и гарантия деловой репутации"
    },
    {
      icon: "Users",
      title: "Цифровая экосистема",
      description: "Автоматизация всех этапов: от поиска до согласования контрактов"
    },
    {
      icon: "TrendingUp",
      title: "Оптимизация затрат",
      description: "Снижение операционных расходов за счет прозрачности и конкуренции"
    },
    {
      icon: "FileCheck",
      title: "Аналитика и отчетность",
      description: "Комплексная аналитика закупок для принятия обоснованных решений"
    }
  ];

  const categories = [
    { name: "Промышленные товары", count: "2,500+" },
    { name: "Строительные материалы", count: "1,800+" },
    { name: "Продукты питания", count: "3,200+" },
    { name: "Текстиль и одежда", count: "1,500+" },
    { name: "Электроника", count: "950+" },
    { name: "Химическая продукция", count: "720+" }
  ];

  return (
    <>
      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ключевые преимущества платформы
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Комплексные решения для оптимизации закупочных процессов и минимизации рисков
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md p-2">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon name={feature.icon as any} size={28} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="catalog" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Каталог товаров
            </h2>
            <p className="text-lg text-gray-600">
              Широкий ассортимент товаров от проверенных поставщиков
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <Icon name="ArrowRight" size={20} className="text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{category.count}</div>
                  <p className="text-xs text-gray-600 mt-1">товаров в категории</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;