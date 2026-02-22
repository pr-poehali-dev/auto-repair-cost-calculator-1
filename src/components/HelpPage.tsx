import Icon from "@/components/ui/icon";

const HelpPage = () => {
  const steps = [
    { icon: "Car", title: "Выберите автомобиль", desc: "Последовательно выберите марку, модель, поколение и модификацию (двигатель + КПП) из выпадающих списков." },
    { icon: "Wrench", title: "Выберите работу", desc: "Укажите категорию и конкретный вид работы по замене запчасти." },
    { icon: "Calculator", title: "Нажмите «Рассчитать»", desc: "Система автоматически рассчитает количество нормачасов и стоимость работы." },
    { icon: "FileText", title: "Получите результат", desc: "Отображается два варианта стоимости: базовая и с наценкой 20% для клиента." },
  ];

  const faq = [
    {
      q: "Что такое нормачас?",
      a: "Нормачас (н/ч) — это условная единица измерения трудозатрат. Один нормачас = 60 минут работы специалиста по нормативу. Реальное время может отличаться."
    },
    {
      q: "Что означает «Со своими запчастями»?",
      a: "Это стоимость только работы, когда клиент использует запчасти самого автотехцентра. Рассчитывается как: нормачасы × базовая ставка."
    },
    {
      q: "Что означает «С наценкой +20%»?",
      a: "Стоимость работы с надбавкой 20%, применяется когда клиент привозит сторонние запчасти. Рассчитывается как: базовая стоимость × 1.20."
    },
    {
      q: "Как изменить ставку нормачаса?",
      a: "Ставку меняет администратор в разделе «Администратор». Изменение действует сразу на все последующие расчёты."
    },
    {
      q: "Как загрузить свою базу автомобилей?",
      a: "База данных формируется из Excel-файла. Для загрузки вашей базы обратитесь к разработчику — файл должен содержать марки, модели, поколения и модификации."
    },
    {
      q: "Где сохраняются расчёты?",
      a: "История расчётов доступна в разделе «История» в рамках текущей сессии. При закрытии браузера история очищается."
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-foreground">Справка по работе системы</h2>
        <p className="text-muted-foreground text-sm mt-1">Руководство пользователя калькулятора нормачасов</p>
      </div>

      {/* How to use */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="BookOpen" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Как пользоваться</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(215,70%,22%)] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <Icon name={step.icon} size={18} className="text-[hsl(25,95%,50%)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-full w-4 -ml-2 border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Sigma" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Формулы расчёта</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-3">Вариант 1 — Со своими запчастями</p>
            <div className="bg-white border border-green-200 rounded p-3 font-mono text-sm text-green-800 mb-3">
              Стоимость = Нормачасы × Ставка н/ч
            </div>
            <p className="text-xs text-green-600">Пример: 2 н/ч × 2 500 ₽ = <strong>5 000 ₽</strong></p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-3">Вариант 2 — С наценкой +20%</p>
            <div className="bg-white border border-orange-200 rounded p-3 font-mono text-sm text-orange-800 mb-3">
              Стоимость = Нормачасы × Ставка н/ч × 1.20
            </div>
            <p className="text-xs text-orange-600">Пример: 2 н/ч × 2 500 ₽ × 1.20 = <strong>6 000 ₽</strong></p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Icon name="HelpCircle" size={18} className="text-[hsl(215,70%,22%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Часто задаваемые вопросы</h3>
        </div>
        <div className="p-6 space-y-4">
          {faq.map((item, i) => (
            <div key={i} className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="font-semibold text-sm text-foreground flex items-start gap-2 mb-2">
                <Icon name="ChevronRight" size={16} className="text-[hsl(25,95%,50%)] mt-0.5 shrink-0" />
                {item.q}
              </p>
              <p className="text-sm text-muted-foreground pl-6 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-[hsl(215,70%,22%)] rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Phone" size={18} className="text-[hsl(25,95%,50%)]" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Техническая поддержка</h3>
        </div>
        <p className="text-sm text-blue-200 mt-2">
          По вопросам загрузки базы данных из Excel, настройки системы и расширения функционала — обратитесь к разработчику.
        </p>
      </div>
    </div>
  );
};

export default HelpPage;
