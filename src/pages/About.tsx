import Header from "@/components/Header";
import Icon from '@/components/ui/icon';

const About = () => {
  const teamMembers = [
    {
      name: "Алексей Петров",
      position: "Генеральный директор",
      experience: "15+ лет в B2B",
      avatar: "👨‍💼",
      description: "Эксперт в области корпоративных закупок и стратегического развития"
    },
    {
      name: "Мария Козлова", 
      position: "CTO",
      experience: "12+ лет в IT",
      avatar: "👩‍💻",
      description: "Руководит технологическим развитием платформы и внедрением ИИ"
    },
    {
      name: "Дмитрий Соколов",
      position: "Директор по развитию",
      experience: "10+ лет в продажах",
      avatar: "👨‍💼",
      description: "Отвечает за расширение партнерской сети и привлечение поставщиков"
    },
    {
      name: "Анна Морозова",
      position: "Head of Customer Success",
      experience: "8+ лет в клиентском сервисе",
      avatar: "👩‍💼",
      description: "Обеспечивает высокий уровень сервиса и удовлетворенности клиентов"
    }
  ];

  const values = [
    {
      icon: "Handshake",
      title: "Доверие",
      description: "Мы строим долгосрочные партнерские отношения, основанные на прозрачности и надежности"
    },
    {
      icon: "Lightbulb", 
      title: "Инновации",
      description: "Постоянно внедряем новые технологии для улучшения пользовательского опыта"
    },
    {
      icon: "Users",
      title: "Клиентоориентированность", 
      description: "Каждое решение принимается с учетом потребностей наших клиентов"
    },
    {
      icon: "TrendingUp",
      title: "Развитие",
      description: "Помогаем бизнесу расти и оптимизировать процессы закупок"
    }
  ];

  const milestones = [
    { year: "2018", title: "Основание", description: "Создание компании и разработка первой версии платформы" },
    { year: "2019", title: "Первые 100 поставщиков", description: "Достижение первой значимой отметки в развитии сети" },
    { year: "2020", title: "500+ партнеров", description: "Расширение географии и количества поставщиков" },
    { year: "2021", title: "Внедрение ИИ", description: "Запуск системы умного поиска и рекомендаций" },
    { year: "2022", title: "Мобильное приложение", description: "Выпуск приложений для iOS и Android" },
    { year: "2023", title: "API для интеграций", description: "Открытие API для интеграции с ERP-системами" },
    { year: "2024", title: "2500+ поставщиков", description: "Крупнейшая B2B платформа в своей категории" }
  ];

  const stats = [
    { number: "2500+", label: "Поставщиков", icon: "Building2", color: "text-blue-600" },
    { number: "15К+", label: "Товарных позиций", icon: "Package", color: "text-green-600" },
    { number: "98%", label: "Довольных клиентов", icon: "Star", color: "text-yellow-600" },
    { number: "24/7", label: "Поддержка клиентов", icon: "Clock", color: "text-purple-600" },
    { number: "99.9%", label: "Uptime платформы", icon: "Shield", color: "text-red-600" },
    { number: "150+", label: "Городов России", icon: "MapPin", color: "text-indigo-600" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="ml-56 transition-all duration-300">
        
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                О компании Business Market
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
                Лидер в области корпоративных B2B закупок в России с 2018 года
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Icon name="Award" size={20} />
                <span>Более 6 лет успешной работы на рынке</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white rounded-2xl p-8 border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="Target" size={28} className="text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">Наша миссия</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Создать экосистему, где каждая компания может эффективно управлять 
                  закупками, находить надежных поставщиков и развивать бизнес. 
                  Мы объединяем традиционный опыт с современными технологиями.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="Eye" size={28} className="text-secondary" />
                  <h2 className="text-2xl font-bold text-gray-900">Наше видение</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Стать ведущей технологической платформой для B2B коммерции в СНГ, 
                  где бизнес находит все необходимое для роста: от товаров и услуг 
                  до аналитики и финансовых инструментов.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши ценности</h2>
              <p className="text-xl text-gray-600">Принципы, которыми мы руководствуемся в работе</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <Icon name={value.icon as any} size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">История развития</h2>
              <p className="text-xl text-gray-600">Ключевые вехи нашего пути</p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      <span className="text-sm">{milestone.year}</span>
                    </div>
                    <div className="bg-white rounded-xl p-6 border shadow-sm flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши достижения</h2>
              <p className="text-xl text-gray-600">Цифры, которыми мы гордимся</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-8 border shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <Icon name={stat.icon as any} size={32} className={stat.color} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Команда</h2>
              <p className="text-xl text-gray-600">Люди, которые делают платформу лучше каждый день</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="text-4xl mb-4">{member.avatar}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                  <p className="text-sm text-gray-500 mb-3">{member.experience}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Готовы начать сотрудничество?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нашей командой экспертов для персональной консультации 
              и индивидуального предложения
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Icon name="Phone" size={20} />
                Позвонить нам
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                <Icon name="Mail" size={20} />
                Написать письмо
              </button>
              <button className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2">
                <Icon name="MessageCircle" size={20} />
                Telegram чат
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-blue-500">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Icon name="MapPin" size={24} className="mx-auto mb-2" />
                  <p className="text-blue-100">Москва, Красная площадь, 1</p>
                </div>
                <div>
                  <Icon name="Clock" size={24} className="mx-auto mb-2" />
                  <p className="text-blue-100">Пн-Пт: 9:00-18:00</p>
                </div>
                <div>
                  <Icon name="Phone" size={24} className="mx-auto mb-2" />
                  <p className="text-blue-100">+7 (495) 123-45-67</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;