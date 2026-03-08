import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
                Условия пользования
              </h1>
              
              <div className="prose prose-gray max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Общие положения
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Настоящие условия пользования регулируют отношения между ООО "Business Market" 
                  и пользователями платформы. Используя наш сервис, вы соглашаетесь с данными условиями.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Описание сервиса
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Business Market — это B2B платформа для эффективного ведения бизнеса, 
                  предоставляющая инструменты для управления заказами, каталогом товаров, 
                  поставщиками и аналитикой.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Права и обязанности пользователей
                </h2>
                <div className="text-gray-700 mb-6 leading-relaxed">
                  <p className="mb-3"><strong>Пользователь имеет право:</strong></p>
                  <ul className="list-disc ml-6 mb-4">
                    <li>Использовать все функции платформы в соответствии с тарифным планом</li>
                    <li>Получать техническую поддержку</li>
                    <li>Экспортировать свои данные</li>
                  </ul>
                  
                  <p className="mb-3"><strong>Пользователь обязуется:</strong></p>
                  <ul className="list-disc ml-6">
                    <li>Предоставлять достоверную информацию при регистрации</li>
                    <li>Не нарушать работу платформы</li>
                    <li>Соблюдать применимое законодательство</li>
                    <li>Своевременно оплачивать услуги согласно выбранному тарифу</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Конфиденциальность данных
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Мы обязуемся защищать конфиденциальность ваших данных в соответствии с нашей 
                  Политикой конфиденциальности. Все данные хранятся на защищенных серверах 
                  с применением современных методов шифрования.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  5. Оплата и возврат средств
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Оплата производится согласно выбранному тарифному плану. Возврат средств 
                  возможен в течение 14 дней с момента оплаты при условии отсутствия нарушений 
                  настоящих условий.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  6. Ответственность
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Компания не несет ответственности за убытки, возникшие в результате 
                  неправильного использования платформы или технических сбоев, не связанных 
                  с нашей виной.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  7. Изменение условий
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Мы оставляем за собой право изменять данные условия с предварительным 
                  уведомлением пользователей за 30 дней до вступления изменений в силу.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  8. Контактная информация
                </h2>
                <div className="text-gray-700 mb-8 leading-relaxed">
                  <p className="mb-2">По всем вопросам обращайтесь:</p>
                  <p className="mb-1">Email: support@businessmarket.ru</p>
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

export default Terms;