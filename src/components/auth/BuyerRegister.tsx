import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface BuyerRegisterProps {
  onClose: () => void;
}

export default function BuyerRegister({ onClose }: BuyerRegisterProps) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    position: '',
    businessType: '',
    purchaseVolume: '',
    interests: [] as string[],
    password: '',
    confirmPassword: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const totalSteps = 3;

  const interestOptions = [
    'Электроника',
    'Одежда и текстиль', 
    'Продукты питания',
    'Строительные материалы',
    'Автозапчасти',
    'Мебель',
    'Спортивные товары',
    'Косметика',
    'Канцелярские товары',
    'Промышленное оборудование'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await register({
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      user_type: 'buyer',
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      company_name: formData.companyName,
      position: formData.position,
      business_type: formData.businessType,
      purchase_volume: formData.purchaseVolume,
      interests: formData.interests
    });
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Ошибка регистрации');
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <Icon name="X" size={24} />
        </button>

        {/* Прогресс */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Регистрация покупателя
            </h2>
            <span className="text-sm text-gray-500">
              Шаг {currentStep} из {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Шаг 1: Личная информация */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="User" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Личная информация
                </h3>
                <p className="text-gray-600 text-sm">
                  Расскажите о себе
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Иван"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Петров"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ivan.petrov@company.ru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Компания
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ООО Торговая компания"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Должность
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Менеджер по закупкам"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Бизнес-информация */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Briefcase" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Бизнес-информация
                </h3>
                <p className="text-gray-600 text-sm">
                  Помогите нам подобрать подходящих поставщиков
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип бизнеса *
                  </label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите тип</option>
                    <option value="retail">Розничная торговля</option>
                    <option value="wholesale">Оптовая торговля</option>
                    <option value="manufacturing">Производство</option>
                    <option value="horeca">HoReCa</option>
                    <option value="ecommerce">Интернет-торговля</option>
                    <option value="construction">Строительство</option>
                    <option value="services">Сфера услуг</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Объем закупок в месяц
                  </label>
                  <select
                    value={formData.purchaseVolume}
                    onChange={(e) => setFormData({...formData, purchaseVolume: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите объем</option>
                    <option value="small">До 100 000 ₽</option>
                    <option value="medium">100 000 - 500 000 ₽</option>
                    <option value="large">500 000 - 1 000 000 ₽</option>
                    <option value="enterprise">Свыше 1 000 000 ₽</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Интересующие категории товаров
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <label
                      key={interest}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.interests.includes(interest)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {interest}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Выберите категории, которые вас интересуют
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Преимущества указания бизнес-информации:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Персональные рекомендации поставщиков</li>
                      <li>• Специальные предложения и скидки</li>
                      <li>• Приоритетная поддержка менеджеров</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 3: Безопасность */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Shield" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Настройка безопасности
                </h3>
                <p className="text-gray-600 text-sm">
                  Создайте надежный пароль для защиты аккаунта
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Создайте пароль"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Подтверждение пароля *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Повторите пароль"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Требования к паролю:</p>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Минимум 8 символов</li>
                      <li>• Хотя бы одна заглавная буква</li>
                      <li>• Хотя бы одна цифра</li>
                      <li>• Хотя бы один специальный символ</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 mr-3"
                    id="terms"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Я соглашаюсь с{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      Условиями использования
                    </Link>{' '}
                    и{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Политикой конфиденциальности
                    </Link>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3"
                    id="newsletter"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Получать уведомления о новых товарах и специальных предложениях
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Навигация */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Далее
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Создать аккаунт
                </button>
              )}
            </div>
          </div>

          {/* Альтернатива */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => {/* Открыть форму входа */}}
                className="text-blue-600 hover:underline font-medium"
              >
                Войти
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}