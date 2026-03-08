import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Footer = () => {
  return (
    <>
      {/* Registration CTA */}
      <section id="buyers" className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold">
              Повысьте эффективность закупок
            </h2>
            <p className="text-lg opacity-90">
              Интегрируйтесь с Business Market для оптимизации всех закупочных процессов. 
              Консалтинг включен.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base">
                <Icon name="Building" size={18} className="mr-2" />
                Стать клиентом
              </Button>
              <Button size="lg" variant="outline" className="text-base border-white text-white hover:bg-white hover:text-primary">
                <Icon name="Store" size={18} className="mr-2" />
                Поставлять товары
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <Icon name="Shield" size={24} className="mx-auto mb-2 opacity-80" />
                <div className="font-semibold">Комплаенс</div>
                <div className="text-sm opacity-80">Полное соответствие</div>
              </div>
              <div className="text-center">
                <Icon name="Clock" size={24} className="mx-auto mb-2 opacity-80" />
                <div className="font-semibold">Автоматизация</div>
                <div className="text-sm opacity-80">Оптимизация процессов</div>
              </div>
              <div className="text-center">
                <Icon name="DollarSign" size={24} className="mx-auto mb-2 opacity-80" />
                <div className="font-semibold">ROI</div>
                <div className="text-sm opacity-80">Минимизация затрат</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon name="Building" size={24} className="text-primary" />
                <span className="text-xl font-bold">Business Market</span>
              </div>
              <p className="text-gray-400 text-sm">
                Корпоративная платформа для бизнес-закупок и продаж между компаниями.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Покупателям</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Поиск поставщиков</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Каталог товаров</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Как покупать</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поставщикам</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Размещение товаров</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Верификация</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Тарифы</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  <span>+7 (800) 123-45-67</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  <span>info@bmmarket.ru</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="mt-0.5" />
                  <div>
                    <div>Москва, ул. Деловая, 1</div>
                    <div className="text-xs text-gray-500">Пн-Пт: 9:00-18:00 МСК</div>
                  </div>
                </div>
                <div className="pt-2">
                  <a 
                    href="/contacts" 
                    className="inline-flex items-center gap-2 text-primary hover:text-blue-400 transition-colors"
                  >
                    <Icon name="ArrowRight" size={14} />
                    <span>Все контакты</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 Business Market. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;