import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const plans = [
    {
      name: "Базовый",
      description: "Для начинающих предпринимателей",
      monthlyPrice: 5000,
      annualPrice: 60000,
      features: [
        "3 месяца бесплатно",
        "До 100 товаров в каталоге",
        "До 50 заказов в месяц",
        "Базовая аналитика",
        "Email поддержка",
        "Мобильное приложение"
      ],
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Профессиональный",
      description: "Для растущего бизнеса",
      monthlyPrice: 15000,
      annualPrice: 180000,
      features: [
        "Всё из Базового",
        "До 1000 товаров в каталоге",
        "Неограниченное количество заказов",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "Интеграция с 1С",
        "CRM система",
        "Автоматизация процессов"
      ],
      popular: true,
      color: "border-primary ring-2 ring-primary/20"
    },
    {
      name: "Корпоративный",
      description: "Для крупного бизнеса",
      monthlyPrice: 30000,
      annualPrice: 360000,
      features: [
        "Всё из Профессионального",
        "Неограниченное количество товаров",
        "Полная аналитика и BI",
        "24/7 поддержка",
        "API доступ",
        "Индивидуальные настройки",
        "Выделенный менеджер",
        "SLA гарантии"
      ],
      popular: false,
      color: "border-gray-200"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handlePayment = async (plan: any) => {
    setLoadingPlan(plan.name);

    try {
      const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
      const period = isAnnual ? 'annual' : 'monthly';

      const response = await fetch('https://functions.poehali.dev/fe19231c-098a-4434-9153-878c8de41edf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: plan.name,
          amount: amount,
          period: period,
          email: user?.email || ''
        })
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось создать платеж",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к платежной системе",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <Header />
      
      <div className="ml-56 transition-all duration-300">
        <div className="container mx-auto px-4 py-12">
          {/* Заголовок */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Icon name="Zap" size={16} />
              Специальное предложение
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Выберите свой тариф
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Начните с 3 месяцами бесплатно и масштабируйте бизнес без ограничений
            </p>
            
            {/* Переключатель месяц/год */}
            <div className="inline-flex items-center bg-white shadow-lg rounded-full p-2 border border-gray-200">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  !isAnnual ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all relative ${
                  isAnnual ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ежегодно
                {isAnnual && (
                  <Badge className="absolute -top-2 -right-2 bg-secondary text-white text-xs px-2 py-0.5 shadow-md animate-bounce-gentle">
                    -8%
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Тарифные планы */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-12">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-primary ring-2 ring-primary/30 shadow-xl bg-gradient-to-br from-white to-primary/5' 
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 shadow-lg text-sm font-bold">
                      <Icon name="Star" size={14} className="mr-1 inline" />
                      Популярный
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 pt-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.popular ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-gray-100'
                  }`}>
                    <Icon name={plan.popular ? 'Rocket' : index === 0 ? 'Package' : 'Building2'} size={32} className={plan.popular ? 'text-white' : 'text-gray-600'} />
                  </div>
                  <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  
                  <div className="py-6 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {formatPrice(isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice)}
                      </span>
                      <span className="text-gray-600 text-lg font-semibold">₽</span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">в месяц</div>
                    {isAnnual && (
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-secondary font-semibold bg-secondary/10 px-3 py-1 rounded-full">
                        <Icon name="TrendingDown" size={12} />
                        Экономия {formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)} ₽/год
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start group">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                          plan.popular ? 'bg-primary/20' : 'bg-gray-100'
                        } group-hover:scale-110 transition-transform`}>
                          <Icon name="Check" size={14} className={plan.popular ? 'text-primary' : 'text-secondary'} />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-6 text-base font-semibold transition-all group ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105' 
                        : 'bg-gray-900 hover:bg-primary text-white'
                    }`}
                    onClick={() => handlePayment(plan)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        <span>Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <span>Начать работу</span>
                        <Icon name="ArrowRight" size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  {plan.popular && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Первые 3 месяца бесплатно
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Часто задаваемые вопросы
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Можно ли изменить тариф?</h3>
                  <p className="text-gray-600 text-sm">
                    Да, вы можете повысить или понизить тариф в любое время. 
                    Изменения вступят в силу в следующем расчетном периоде.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Есть ли пробный период?</h3>
                  <p className="text-gray-600 text-sm">
                    Да, новые поставщики получают 3 месяца бесплатного использования 
                    со всеми функциями выбранного тарифа.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Какие способы оплаты доступны?</h3>
                  <p className="text-gray-600 text-sm">
                    Мы принимаем банковские карты, переводы, электронные кошельки 
                    и безналичную оплату для юридических лиц.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Нужна ли техническая поддержка?</h3>
                  <p className="text-gray-600 text-sm">
                    Да, мы предоставляем техническую поддержку всем клиентам. 
                    Время ответа зависит от выбранного тарифного плана.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Призыв к действию */}
          <div className="mt-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Готовы начать?
            </h2>
            <p className="text-xl mb-6 text-white/80">
              Присоединяйтесь к тысячам успешных предпринимателей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-gray-100"
              >
                Попробовать бесплатно
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default PricingPage;