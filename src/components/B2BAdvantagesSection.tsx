import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const B2BAdvantagesSection = () => {
  const advantages = [
    {
      icon: "FileText",
      title: "Документооборот по ФЗ-223",
      description: "Полное соответствие требованиям закупочного законодательства",
      badge: "Госзакупки"
    },
    {
      icon: "Shield",
      title: "ЭЦП и криптозащита",
      description: "Юридическая значимость всех операций с электронной подписью",
      badge: "Безопасность"
    },
    {
      icon: "Calculator",
      title: "НДС и налоговые льготы",
      description: "Автоматический расчет налогов и применение льготных ставок",
      badge: "Налоги"
    },
    {
      icon: "Building2",
      title: "Корпоративные скидки",
      description: "Специальные условия для крупных заказов от 100 тыс. рублей",
      badge: "Экономия"
    },
    {
      icon: "Users",
      title: "Персональный менеджер",
      description: "Выделенный специалист для решения задач вашего бизнеса",
      badge: "Поддержка"
    },
    {
      icon: "BarChart3",
      title: "Отчетность для бухгалтерии",
      description: "Готовые отчеты в формате Excel и 1С для ваших финансистов",
      badge: "Отчеты"
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Icon name="Briefcase" size={14} className="mr-1" />
            Для юридических лиц
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Преимущества для бизнеса
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Специальные условия и возможности для компаний, ИП и государственных организаций
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {advantages.map((advantage, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon name={advantage.icon} size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{advantage.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {advantage.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Дополнительные гарантии */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircle2" size={28} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Договор поставки</h4>
              <p className="text-sm text-gray-600">
                Официальные документы с полным юридическим сопровождением
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Clock" size={28} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Отсрочка платежа</h4>
              <p className="text-sm text-gray-600">
                Гибкие условия оплаты до 30 дней для проверенных партнеров
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Award" size={28} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Гарантия качества</h4>
              <p className="text-sm text-gray-600">
                Возврат или замена товара в течение 14 дней без вопросов
              </p>
            </div>
          </div>
        </div>

        {/* Статистика для бизнеса */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">5,000+</div>
            <div className="text-sm text-gray-600">Юридических лиц</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">₽50М</div>
            <div className="text-sm text-gray-600">Средний оборот</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">24ч</div>
            <div className="text-sm text-gray-600">Обработка заявок</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">99%</div>
            <div className="text-sm text-gray-600">Довольных клиентов</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default B2BAdvantagesSection;