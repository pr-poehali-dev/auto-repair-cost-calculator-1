import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [inn, setInn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSendCode = () => {
    setStep(2);
  };

  const handleVerifyCode = () => {
    setStep(3);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    
    if (companyLogo) {
      localStorage.setItem('companyLogo', companyLogo);
    }
    
    const userData = {
      phone,
      fullName,
      email,
      inn,
      companyLogo: companyLogo ? 'uploaded' : 'none'
    };
    
    console.log('Регистрация:', userData);
    alert('Регистрация завершена! (демо-версия)');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Регистрация</h2>
        <p className="text-gray-600">Создайте аккаунт для доступа к платформе</p>
      </div>

      {/* Шаг 1: Ввод номера телефона */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Номер телефона
            </Label>
            <div className="mt-1 relative">
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="pl-10"
              />
              <Icon name="Phone" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <Button 
            onClick={handleSendCode}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!phone.trim()}
          >
            Отправить код
          </Button>
        </div>
      )}

      {/* Шаг 2: Ввод кода подтверждения */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">
              Код подтверждения
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Код отправлен на номер {phone}
            </p>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="1234"
              maxLength={4}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button 
              onClick={handleVerifyCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={code.length !== 4}
            >
              Подтвердить
            </Button>
          </div>
        </div>
      )}

      {/* Шаг 3: Заполнение данных */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              ФИО <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 relative">
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                className="pl-10"
                required
              />
              <Icon name="User" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="pl-10"
                required
              />
              <Icon name="Mail" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Пароль <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="pl-10"
                required
              />
              <Icon name="Lock" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Подтвердите пароль <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 relative">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                className="pl-10"
                required
              />
              <Icon name="Lock" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Пароли не совпадают</p>
            )}
          </div>

          <div>
            <Label htmlFor="inn" className="text-sm font-medium text-gray-700">
              ИНН <span className="text-gray-400">(необязательно)</span>
            </Label>
            <div className="mt-1 relative">
              <Input
                id="inn"
                type="text"
                value={inn}
                onChange={(e) => setInn(e.target.value)}
                placeholder="1234567890"
                className="pl-10"
                maxLength={12}
              />
              <Icon name="FileText" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
              Логотип компании <span className="text-gray-400">(необязательно)</span>
            </Label>
            <div className="mt-2">
              {companyLogo ? (
                <div className="flex items-center gap-4">
                  <img 
                    src={companyLogo} 
                    alt="Логотип компании" 
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">{logoFile?.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCompanyLogo(null);
                        setLogoFile(null);
                      }}
                    >
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="logo" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Icon name="Upload" size={24} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">Нажмите для загрузки</p>
                    <p className="text-xs text-gray-400">PNG, JPG до 5MB</p>
                  </div>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!fullName.trim() || !email.trim() || !password.trim() || password !== confirmPassword}
            >
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Зарегистрироваться
            </Button>
          </div>
        </form>
      )}

      {/* Индикатор шагов */}
      <div className="flex justify-center mt-6 space-x-2">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-3 h-3 rounded-full ${
              step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistrationForm;