import Icon from '@/components/ui/icon';

const AboutSection = () => {
  return (
    <section id="about" className="py-12 md:py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          
          {/* Заголовок */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6 px-2">
              О компании Business Market
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Лидер в области корпоративных B2B закупок в России. 
              С 2018 года помогаем компаниям оптимизировать процессы снабжения.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
            
            {/* Левая колонка - История и миссия */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 md:gap-3 flex-wrap">
                  <Icon name="Target" size={24} className="text-blue-600 flex-shrink-0" />
                  <span>Наша миссия</span>
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Создать экосистему, где каждая компания может эффективно управлять 
                  закупками, находить надежных поставщиков и развивать бизнес. 
                  Мы объединяем традиционный опыт с современными технологиями.
                </p>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 md:gap-3 flex-wrap">
                  <Icon name="Clock" size={24} className="text-green-600 flex-shrink-0" />
                  <span>История развития</span>
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-16 md:w-20 text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 rounded px-2 py-1 flex-shrink-0 text-center">
                      2018
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Основание компании и запуск MVP платформы</p>
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-16 md:w-20 text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 rounded px-2 py-1 flex-shrink-0 text-center">
                      2020
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Достигли отметки 500+ активных поставщиков</p>
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-16 md:w-20 text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 rounded px-2 py-1 flex-shrink-0 text-center">
                      2022
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Запуск ИИ-аналитики и автоматизации процессов</p>
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-16 md:w-20 text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 rounded px-2 py-1 flex-shrink-0 text-center">
                      2024
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">Более 2500 поставщиков и 15000+ товарных позиций</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - Преимущества и команда */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 flex-wrap">
                  <Icon name="Award" size={24} className="text-yellow-600 flex-shrink-0" />
                  <span>Наши достижения</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg p-3 md:p-4 border min-w-0">
                    <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1 truncate">98%</div>
                    <div className="text-xs md:text-sm text-gray-600 leading-tight">Довольных клиентов</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 border min-w-0">
                    <div className="text-xl md:text-2xl font-bold text-green-600 mb-1 truncate">24/7</div>
                    <div className="text-xs md:text-sm text-gray-600 leading-tight">Поддержка</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 border min-w-0">
                    <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1 truncate">2500+</div>
                    <div className="text-xs md:text-sm text-gray-600 leading-tight">Поставщиков</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 border min-w-0">
                    <div className="text-xl md:text-2xl font-bold text-orange-600 mb-1 truncate">15К+</div>
                    <div className="text-xs md:text-sm text-gray-600 leading-tight">Товаров</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Icon name="Users" size={28} className="text-purple-600" />
                  Почему выбирают нас
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Shield" size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Безопасность</h4>
                      <p className="text-sm text-gray-600">Все поставщики проходят верификацию</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Zap" size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Скорость</h4>
                      <p className="text-sm text-gray-600">Автоматизация процессов закупок</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="BarChart3" size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Аналитика</h4>
                      <p className="text-sm text-gray-600">Детальная отчетность и прогнозы</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Heart" size={20} className="text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Поддержка</h4>
                      <p className="text-sm text-gray-600">Персональный менеджер для каждого клиента</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Команда и контакты */}
          <div className="mt-12 md:mt-16 text-center">
            <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 border max-w-4xl mx-auto">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
                Готовы начать сотрудничество?
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-2">
                Свяжитесь с нашей командой экспертов для персональной консультации
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center px-2">
                <button className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base min-w-0">
                  <Icon name="Phone" size={18} className="flex-shrink-0" />
                  <span className="truncate">Позвонить</span>
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm md:text-base min-w-0">
                  <Icon name="Mail" size={18} className="flex-shrink-0" />
                  <span className="truncate">Написать</span>
                </button>
                <button className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 text-sm md:text-base min-w-0">
                  <Icon name="MessageCircle" size={18} className="flex-shrink-0" />
                  <span className="truncate">Telegram</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;