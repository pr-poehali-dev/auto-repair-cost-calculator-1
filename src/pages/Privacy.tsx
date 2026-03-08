import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 py-12 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Кнопка возврата */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
            </div>

            {/* Основное содержание */}
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Политика конфиденциальности
              </h1>
              
              <div className="prose prose-gray max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Общая информация
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Настоящая Политика конфиденциальности описывает, как ООО "Business Market" 
                  собирает, использует, хранит и защищает персональные данные пользователей 
                  нашей платформы.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Какие данные мы собираем
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3">При регистрации и использовании сервиса мы можем собирать:</p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>ФИО и контактную информацию (телефон, email)</li>
                    <li>Данные компании (название, ИНН, адрес)</li>
                    <li>Информацию о товарах и услугах</li>
                    <li>Данные о транзакциях и заказах</li>
                    <li>Техническую информацию (IP-адрес, браузер, устройство)</li>
                    <li>Данные об использовании сервиса (логи, статистика)</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Как мы используем данные
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3">Собранные данные используются для:</p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>Предоставления и улучшения наших услуг</li>
                    <li>Обработки заказов и платежей</li>
                    <li>Связи с вами по вопросам сервиса</li>
                    <li>Персонализации пользовательского опыта</li>
                    <li>Анализа и улучшения функциональности платформы</li>
                    <li>Соблюдения законодательных требований</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Передача данных третьим лицам
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3">Мы можем передавать ваши данные третьим лицам только в следующих случаях:</p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>С вашего явного согласия</li>
                    <li>Поставщикам услуг, работающим от нашего имени</li>
                    <li>При требовании государственных органов</li>
                    <li>При продаже или реорганизации компании</li>
                  </ul>
                  <p>Все наши партнеры обязаны соблюдать конфиденциальность ваших данных.</p>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  5. Безопасность данных
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3">Для защиты ваших данных мы применяем:</p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>Шифрование данных при передаче и хранении</li>
                    <li>Регулярные проверки безопасности</li>
                    <li>Ограниченный доступ к персональным данным</li>
                    <li>Современные системы защиты от взлома</li>
                    <li>Регулярное резервное копирование</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  6. Ваши права
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3">В соответствии с законодательством вы имеете право:</p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>Получать информацию о обработке ваших данных</li>
                    <li>Требовать исправления неточных данных</li>
                    <li>Требовать удаления ваших данных</li>
                    <li>Ограничивать обработку данных</li>
                    <li>Получать данные в переносимом формате</li>
                    <li>Отозвать согласие на обработку данных</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  7. Cookies и аналитика
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Наш сайт использует cookies для улучшения пользовательского опыта и анализа 
                  трафика. Вы можете управлять настройками cookies в вашем браузере. 
                  Мы также можем использовать сервисы веб-аналитики для улучшения нашего сервиса.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  8. Хранение данных
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Мы храним ваши персональные данные только в течение времени, необходимого 
                  для достижения целей обработки, или в соответствии с требованиями 
                  законодательства. После этого данные удаляются или анонимизируются.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  9. Изменения в политике
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Мы можем обновлять данную политику конфиденциальности. О существенных 
                  изменениях мы уведомим вас по email или через уведомления на платформе.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  10. Контакты
                </h2>
                <div className="text-gray-700 mb-8 leading-relaxed">
                  <p className="mb-2">По вопросам обработки персональных данных обращайтесь:</p>
                  <p className="mb-1">Email: privacy@businessmarket.ru</p>
                  <p className="mb-1">Телефон: +7 (800) 123-45-67</p>
                  <p>Адрес: г. Москва, ул. Деловая, д. 1</p>
                </div>

                <div className="text-sm text-gray-500 pt-6 border-t">
                  <p>Последнее обновление: 30 августа 2025 г.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;