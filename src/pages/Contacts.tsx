import Header from "@/components/Header";
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'general',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Здесь будет логика отправки формы
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const offices = [
    {
      city: "Москва",
      address: "ул. Деловая, 1, БЦ «Центр»",
      postcode: "125009",
      phone: "+7 (495) 123-45-67",
      email: "moscow@bmmarket.ru",
      hours: "Пн-Пт: 9:00-18:00",
      description: "Главный офис",
      coordinates: "55.751244, 37.618423"
    },
    {
      city: "Санкт-Петербург", 
      address: "Невский проспект, 85, офис 401",
      postcode: "191025",
      phone: "+7 (812) 987-65-43",
      email: "spb@bmmarket.ru", 
      hours: "Пн-Пт: 9:00-18:00",
      description: "Региональный офис",
      coordinates: "59.934280, 30.335099"
    },
    {
      city: "Екатеринбург",
      address: "ул. Ленина, 5, БЦ «Высоцкий»",
      postcode: "620014", 
      phone: "+7 (343) 555-77-88",
      email: "ekb@bmmarket.ru",
      hours: "Пн-Пт: 9:00-18:00",
      description: "Региональный офис",
      coordinates: "56.838011, 60.597474"
    }
  ];

  const departments = [
    {
      name: "Отдел продаж",
      phone: "+7 (800) 123-45-67",
      email: "sales@bmmarket.ru",
      description: "Консультации по продуктам, тарифам и подключению",
      icon: "ShoppingCart",
      color: "text-primary"
    },
    {
      name: "Техническая поддержка", 
      phone: "+7 (495) 987-65-43",
      email: "support@bmmarket.ru",
      description: "Помощь с платформой, интеграциями и техническими вопросами",
      icon: "Headphones",
      color: "text-secondary"
    },
    {
      name: "Финансовый отдел",
      phone: "+7 (495) 111-22-33",
      email: "finance@bmmarket.ru", 
      description: "Вопросы по оплате, документооборот, реквизиты",
      icon: "CreditCard",
      color: "text-accent"
    },
    {
      name: "Отдел партнерств",
      phone: "+7 (495) 444-55-66",
      email: "partners@bmmarket.ru",
      description: "Сотрудничество, интеграции, B2B партнерство",
      icon: "Handshake",
      color: "text-primary"
    }
  ];

  const socialLinks = [
    { name: "Telegram", icon: "MessageCircle", link: "https://t.me/bmmarket", color: "hover:text-blue-500" },
    { name: "WhatsApp", icon: "MessageSquare", link: "https://wa.me/78001234567", color: "hover:text-green-500" },
    { name: "VK", icon: "Globe", link: "https://vk.com/bmmarket", color: "hover:text-blue-600" },
    { name: "YouTube", icon: "Play", link: "https://youtube.com/bmmarket", color: "hover:text-red-500" }
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
                Свяжитесь с нами
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
                Готовы ответить на ваши вопросы и помочь с интеграцией Business Market
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Icon name="Phone" size={16} />
                  <span>+7 (800) 123-45-67</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Icon name="Mail" size={16} />
                  <span>info@bmmarket.ru</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Icon name="Clock" size={16} />
                  <span>Пн-Пт: 9:00-18:00 МСК</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Contact Methods */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Быстрая связь</h2>
              <p className="text-xl text-gray-600">Выберите удобный способ связи</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all ${social.color} group`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto group-hover:bg-current group-hover:text-white transition-colors">
                      <Icon name={social.icon as any} size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-current">
                      {social.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Написать в {social.name.toLowerCase()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Departments */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Отделы и специалисты</h2>
              <p className="text-xl text-gray-600">Обратитесь к нужному специалисту напрямую</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {departments.map((dept, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${dept.color}`}>
                      <Icon name={dept.icon as any} size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="Phone" size={14} className="text-gray-400" />
                          <a href={`tel:${dept.phone}`} className="text-primary hover:underline">
                            {dept.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size={14} className="text-gray-400" />
                          <a href={`mailto:${dept.email}`} className="text-primary hover:underline">
                            {dept.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form and Offices */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Написать нам</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ваше имя *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Иван Петров"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="ivan@company.ru"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Компания
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="ООО «Ромашка»"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тема обращения
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">Общий вопрос</option>
                      <option value="sales">Продажи и тарифы</option>
                      <option value="support">Техническая поддержка</option>
                      <option value="partnership">Партнерство</option>
                      <option value="finance">Финансовые вопросы</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сообщение *
                    </label>
                    <textarea
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Опишите ваш вопрос или предложение..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="Send" size={18} />
                    Отправить сообщение
                  </button>
                </form>
              </div>

              {/* Offices */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Наши офисы</h2>
                <div className="space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{office.city}</h3>
                          <p className="text-sm text-gray-500">{office.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{office.hours}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Icon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <div>{office.address}</div>
                            <div className="text-gray-500">{office.postcode}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Icon name="Phone" size={16} className="text-gray-400" />
                          <a href={`tel:${office.phone}`} className="text-primary hover:underline">
                            {office.phone}
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Icon name="Mail" size={16} className="text-gray-400" />
                          <a href={`mailto:${office.email}`} className="text-primary hover:underline">
                            {office.email}
                          </a>
                        </div>
                      </div>
                      
                      <button className="mt-4 w-full bg-primary/10 text-primary py-2 px-4 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                        <Icon name="Navigation" size={16} />
                        Показать на карте
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
              <p className="text-xl text-gray-600">Возможно, ответ на ваш вопрос уже есть</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  question: "Как быстро происходит подключение к платформе?",
                  answer: "Базовое подключение занимает 1-2 рабочих дня. Полная настройка с интеграциями - до 1 недели."
                },
                {
                  question: "Есть ли минимальная сумма заказа?",
                  answer: "Минимальная сумма заказа устанавливается каждым поставщиком индивидуально. Обычно от 5 000 рублей."
                },
                {
                  question: "Какие способы оплаты доступны?",
                  answer: "Безналичный расчет по договору, банковские карты, электронные кошельки, факторинг."
                },
                {
                  question: "Предоставляете ли вы техническую поддержку?",
                  answer: "Да, техподдержка работает 24/7. Также доступны персональные менеджеры для крупных клиентов."
                }
              ].map((faq, index) => (
                <details key={index} className="bg-white rounded-lg border p-6 group">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <Icon name="ChevronDown" size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Не нашли ответ на свой вопрос?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами любым удобным способом — мы обязательно поможем!
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:+78001234567"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-colors flex items-center gap-2"
              >
                <Icon name="Phone" size={20} />
                Позвонить
              </a>
              <a
                href="mailto:info@bmmarket.ru"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Icon name="Mail" size={20} />
                Написать email
              </a>
              <a
                href="https://t.me/bmmarket"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="MessageCircle" size={20} />
                Telegram
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contacts;