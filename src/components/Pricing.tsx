import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handlePayment = async (plan: any) => {
    setLoadingPlan(plan.name);

    try {
      const amount = parseFloat(isYearly ? plan.priceYearly.replace(/,/g, '') : plan.priceMonthly.replace(/,/g, ''));
      const period = isYearly ? 'annual' : 'monthly';

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

  const plans = [
    {
      name: 'Базовый',
      priceMonthly: '15,000',
      priceYearly: '180,000',
      period: 'мес',
      description: 'Для малого бизнеса',
      features: [
        'До 100 заказов в месяц',
        'Базовая аналитика',
        'Email поддержка',
        '10 поставщиков',
        'Стандартные отчёты'
      ],
      icon: 'Package',
      popular: false
    },
    {
      name: 'Профессиональный',
      priceMonthly: '7,990',
      priceYearly: '95,880',
      period: 'мес',
      description: 'Для растущего бизнеса',
      features: [
        'До 1000 заказов в месяц',
        'Расширенная аналитика',
        'Приоритетная поддержка',
        'Неограниченно поставщиков',
        'Автоматизация процессов',
        'Персональный менеджер'
      ],
      icon: 'TrendingUp',
      popular: true
    },
    {
      name: 'Корпоративный',
      priceMonthly: '15,990',
      priceYearly: '191,880',
      period: 'мес',
      description: 'Для крупного бизнеса',
      features: [
        'Неограниченное количество заказов',
        'Полная аналитика и BI',
        '24/7 поддержка',
        'API интеграции',
        'Индивидуальные настройки',
        'Выделенный сервер',
        'Обучение команды'
      ],
      icon: 'Building2',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:bg-gray-50 cursor-pointer"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Назад в меню</span>
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Выберите подходящий тариф
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Масштабируйте свой бизнес с нашими гибкими тарифными планами
          </p>
          
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Помесячно
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                isYearly 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Годовой
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                +1 месяц
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary border-primary' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  plan.popular ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Icon 
                    name={plan.icon as any} 
                    size={32} 
                    className={plan.popular ? 'text-primary' : 'text-gray-600'} 
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {isYearly ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-gray-600 ml-1">
                    ₽/{isYearly ? 'год' : plan.period}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm text-emerald-600 font-semibold mt-2">
                    13 месяцев по цене 12
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Icon name="Check" size={16} className="text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                size="lg"
                onClick={() => handlePayment(plan)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.name ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  'Выбрать план'
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Нужен индивидуальный план?
            </h2>
            <p className="text-gray-600 mb-6">
              Свяжитесь с нами для обсуждения корпоративных решений и специальных условий
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                <Icon name="Phone" size={16} className="mr-2" />
                Связаться с менеджером
              </Button>
              <Button variant="outline" size="lg">
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Онлайн консультация
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;