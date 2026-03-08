import Header from "@/components/Header";
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'getting-started', name: 'Начало работы', icon: 'PlayCircle' },
    { id: 'orders', name: 'Заказы и закупки', icon: 'ShoppingCart' },
    { id: 'suppliers', name: 'Поставщики', icon: 'Users' },
    { id: 'payments', name: 'Оплата', icon: 'CreditCard' },
    { id: 'integrations', name: 'Интеграции', icon: 'Link' },
    { id: 'troubleshooting', name: 'Решение проблем', icon: 'AlertCircle' }
  ];

  const articles = {
    'getting-started': [
      {
        title: 'Как зарегистрироваться на платформе',
        content: 'Для регистрации перейдите на главную страницу и нажмите кнопку "Стать клиентом". Заполните форму с данными вашей компании, загрузите документы и дождитесь верификации.',
        tags: ['регистрация', 'верификация', 'документы']
      },
      {
        title: 'Первые шаги после регистрации',
        content: 'После успешной регистрации настройте профиль компании, добавьте контактные данные, выберите категории товаров и настройте способы оплаты.',
        tags: ['настройка', 'профиль', 'категории']
      },
      {
        title: 'Как найти нужный товар',
        content: 'Используйте поиск по каталогу, фильтры по цене, региону поставщика и другим параметрам. Сохраняйте интересные позиции в избранное.',
        tags: ['поиск', 'каталог', 'фильтры']
      },
      {
        title: 'Навигация по платформе',
        content: 'Основные разделы: Каталог (поиск товаров), Заказы (история покупок), Поставщики (управление партнерами), Аналитика (отчеты по закупкам).',
        tags: ['навигация', 'интерфейс', 'разделы']
      }
    ],
    'orders': [
      {
        title: 'Как сделать заказ',
        content: 'Добавьте товары в корзину, укажите количество, выберите способ доставки и оплаты. Проверьте данные и подтвердите заказ.',
        tags: ['заказ', 'корзина', 'оформление']
      },
      {
        title: 'Статусы заказов',
        content: 'Новый → В обработке → Подтвержден → В производстве → Готов к отгрузке → Отправлен → Доставлен → Завершен.',
        tags: ['статусы', 'отслеживание', 'доставка']
      },
      {
        title: 'Отмена и возврат товаров',
        content: 'Заказы можно отменить до статуса "Подтвержден". Для возврата обратитесь к поставщику или в службу поддержки в течение 14 дней.',
        tags: ['отмена', 'возврат', 'гарантии']
      },
      {
        title: 'Работа с корзиной',
        content: 'В корзине можно изменять количество товаров, применять промокоды, выбирать способы доставки. Корзина сохраняется между сеансами.',
        tags: ['корзина', 'промокоды', 'сохранение']
      }
    ],
    'suppliers': [
      {
        title: 'Как выбрать надежного поставщика',
        content: 'Обращайте внимание на рейтинг, отзывы, опыт работы, сертификаты качества и географию поставок. Проверяйте реквизиты компании.',
        tags: ['выбор', 'рейтинг', 'надежность']
      },
      {
        title: 'Система рейтингов и отзывов',
        content: 'Рейтинг формируется на основе качества товаров, соблюдения сроков, качества обслуживания. Оставляйте честные отзывы после покупок.',
        tags: ['рейтинги', 'отзывы', 'качество']
      },
      {
        title: 'Прямая связь с поставщиками',
        content: 'Используйте внутренние сообщения для уточнения условий, обсуждения скидок и решения спорных вопросов.',
        tags: ['общение', 'сообщения', 'переговоры']
      },
      {
        title: 'Работа с договорами',
        content: 'Все поставщики работают по стандартным договорам платформы. Для индивидуальных условий доступны прямые договоры.',
        tags: ['договоры', 'условия', 'документооборот']
      }
    ],
    'payments': [
      {
        title: 'Способы оплаты',
        content: 'Безналичный расчет (основной), банковские карты, электронные кошельки, рассрочка, факторинг для крупных заказов.',
        tags: ['оплата', 'способы', 'рассрочка']
      },
      {
        title: 'Безопасность платежей',
        content: 'Все платежи защищены SSL-шифрованием. Средства резервируются до получения товара. Возможен возврат в случае проблем.',
        tags: ['безопасность', 'защита', 'возврат']
      },
      {
        title: 'Работа с НДС и документами',
        content: 'Автоматическое формирование счетов, актов, накладных. Корректная работа с НДС. Электронный документооборот.',
        tags: ['НДС', 'документы', 'ЭДО']
      },
      {
        title: 'Кредитные лимиты и отсрочка',
        content: 'Для постоянных клиентов доступны кредитные лимиты и отсрочка платежа до 30 дней на основе кредитного скоринга.',
        tags: ['кредит', 'отсрочка', 'скоринг']
      }
    ],
    'integrations': [
      {
        title: 'Интеграция с 1С',
        content: 'Готовые модули для 1С:Предприятие 8.3. Синхронизация справочников, автоматическая выгрузка заказов, обмен документами.',
        tags: ['1С', 'синхронизация', 'автоматизация']
      },
      {
        title: 'API для разработчиков',
        content: 'REST API для интеграции с любыми системами. Документация, примеры кода, песочница для тестирования.',
        tags: ['API', 'разработка', 'интеграция']
      },
      {
        title: 'Мобильное приложение',
        content: 'Приложения для iOS и Android с основными функциями: поиск товаров, оформление заказов, отслеживание доставки.',
        tags: ['мобильное', 'приложение', 'iOS', 'Android']
      },
      {
        title: 'Интеграция с логистикой',
        content: 'Подключение к службам доставки, автоматический расчет стоимости, отслеживание посылок, уведомления о доставке.',
        tags: ['логистика', 'доставка', 'отслеживание']
      }
    ],
    'troubleshooting': [
      {
        title: 'Проблемы с авторизацией',
        content: 'Проверьте правильность email и пароля. При забытом пароле используйте восстановление. Очистите кэш браузера.',
        tags: ['вход', 'пароль', 'авторизация']
      },
      {
        title: 'Медленная работа сайта',
        content: 'Проверьте скорость интернета, обновите браузер, отключите расширения, очистите кэш и cookies.',
        tags: ['скорость', 'браузер', 'кэш']
      },
      {
        title: 'Ошибки при оформлении заказа',
        content: 'Проверьте заполнение всех обязательных полей, корректность данных карты, наличие товара на складе.',
        tags: ['ошибки', 'заказ', 'оформление']
      },
      {
        title: 'Проблемы с загрузкой документов',
        content: 'Поддерживаемые форматы: PDF, JPG, PNG до 10 МБ. Проверьте качество сканов, используйте стабильное соединение.',
        tags: ['документы', 'загрузка', 'форматы']
      }
    ]
  };

  const filteredArticles = articles[activeCategory as keyof typeof articles].filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="ml-56 transition-all duration-300">
        
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Центр помощи
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
                Найдите ответы на вопросы о работе с Business Market
              </p>
              
              {/* Search */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по базе знаний..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-green-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
              <p className="text-xl text-gray-600">Популярные вопросы и действия</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'UserPlus', title: 'Регистрация', description: 'Как создать аккаунт' },
                { icon: 'ShoppingBag', title: 'Первый заказ', description: 'Оформление покупки' },
                { icon: 'CreditCard', title: 'Оплата', description: 'Способы платежей' },
                { icon: 'Truck', title: 'Доставка', description: 'Отслеживание заказов' }
              ].map((action, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <Icon name={action.icon as any} size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-4 gap-8">
              
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Категории</h3>
                  <nav className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          activeCategory === category.id
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon name={category.icon as any} size={18} />
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Articles Content */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {categories.find(cat => cat.id === activeCategory)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {filteredArticles.length} статей найдено
                    {searchQuery && ` по запросу "${searchQuery}"`}
                  </p>
                </div>

                <div className="space-y-6">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Icon name="Search" size={48} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                      <p className="text-gray-600">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
                    </div>
                  ) : (
                    filteredArticles.map((article, index) => (
                      <div key={index} className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{article.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">{article.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="bg-white rounded-2xl p-8 border shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                <Icon name="MessageSquare" size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Не нашли ответ на свой вопрос?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Наша служба поддержки работает 24/7 и всегда готова помочь вам с любыми вопросами
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Icon name="MessageCircle" size={20} />
                  Написать в чат
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Icon name="Phone" size={20} />
                  Позвонить
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Icon name="Mail" size={20} />
                  Написать email
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Clock" size={16} />
                    <span>Среднее время ответа: 5 минут</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Star" size={16} />
                    <span>Рейтинг поддержки: 4.9/5</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Users" size={16} />
                    <span>50+ экспертов онлайн</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Видео-руководства</h2>
              <p className="text-xl text-gray-600">Наглядные инструкции по работе с платформой</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Регистрация и первые шаги', duration: '5:30', views: '12.5k' },
                { title: 'Как найти и заказать товар', duration: '8:15', views: '9.2k' },
                { title: 'Работа с поставщиками', duration: '6:45', views: '7.8k' },
                { title: 'Настройка интеграций', duration: '12:00', views: '4.1k' },
                { title: 'Аналитика и отчеты', duration: '9:30', views: '6.3k' },
                { title: 'Мобильное приложение', duration: '4:20', views: '5.9k' }
              ].map((video, index) => (
                <div key={index} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icon name="Play" size={48} className="text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {video.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Eye" size={14} />
                        {video.views} просмотров
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Help;