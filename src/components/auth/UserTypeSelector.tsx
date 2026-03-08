import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface UserTypeSelectorProps {
  onClose: () => void;
}

export default function UserTypeSelector({ onClose }: UserTypeSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-300 mx-auto my-auto">
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="X" size={24} />
        </button>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Выберите тип аккаунта
          </h2>
          <p className="text-gray-600">
            Это поможет нам настроить интерфейс под ваши потребности
          </p>
        </div>

        {/* Варианты типов пользователей */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Покупатель */}
          <Link
            to="/register/buyer"
            onClick={onClose}
            className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Icon name="ShoppingCart" size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Покупатель
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ищите и покупайте товары от поставщиков
              </p>
              <ul className="text-left text-sm text-gray-500 space-y-1">
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Поиск товаров
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Сравнение цен
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Оптовые закупки
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  История заказов
                </li>
              </ul>
            </div>
          </Link>

          {/* Поставщик */}
          <Link
            to="/register/supplier"
            onClick={onClose}
            className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Icon name="Store" size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Поставщик
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Продавайте товары и управляйте каталогом
              </p>
              <ul className="text-left text-sm text-gray-500 space-y-1">
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Загрузка товаров
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Управление ценами
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Аналитика продаж
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-green-500 mr-2" />
                  Связь с клиентами
                </li>
              </ul>
            </div>
          </Link>
        </div>

        {/* Подсказка */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Не можете определиться? Вы всегда сможете изменить тип аккаунта в настройках
          </p>
        </div>
      </div>
    </div>
  );
}