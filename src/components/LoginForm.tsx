import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const LoginForm = () => {
  const [mode, setMode] = useState<'login' | 'reset' | 'resetCode' | 'newPassword'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Вход:', { phone, password });
    alert('Вход выполнен! (демо-версия)');
  };

  const handleResetRequest = () => {
    console.log('Запрос сброса пароля:', { phone });
    alert('Код восстановления отправлен! (демо-версия)');
    setMode('resetCode');
  };

  const handleResetCodeSubmit = () => {
    if (resetCode.length === 4) {
      setMode('newPassword');
    }
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    console.log('Новый пароль установлен');
    alert('Пароль успешно изменен! (демо-версия)');
    setMode('login');
    setPhone('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' && 'Вход в аккаунт'}
          {mode === 'reset' && 'Восстановление пароля'}
          {mode === 'resetCode' && 'Подтверждение'}
          {mode === 'newPassword' && 'Новый пароль'}
        </h2>
        <p className="text-gray-600">
          {mode === 'login' && 'Войдите в свой аккаунт'}
          {mode === 'reset' && 'Введите номер телефона для восстановления'}
          {mode === 'resetCode' && 'Введите код из SMS'}
          {mode === 'newPassword' && 'Создайте новый пароль'}
        </p>
      </div>

      {/* Форма входа */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="loginPhone" className="text-sm font-medium text-gray-700">
              Номер телефона
            </Label>
            <div className="mt-1 relative">
              <Input
                id="loginPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="pl-10"
                required
              />
              <Icon name="Phone" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="loginPassword" className="text-sm font-medium text-gray-700">
              Пароль
            </Label>
            <div className="mt-1 relative">
              <Input
                id="loginPassword"
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Забыли пароль?
            </button>
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!phone.trim() || !password.trim()}
          >
            <Icon name="LogIn" size={16} className="mr-2" />
            Войти
          </Button>
        </form>
      )}

      {/* Форма запроса восстановления */}
      {mode === 'reset' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="resetPhone" className="text-sm font-medium text-gray-700">
              Номер телефона
            </Label>
            <div className="mt-1 relative">
              <Input
                id="resetPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="pl-10"
              />
              <Icon name="Phone" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setMode('login')}
              className="flex-1"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button 
              onClick={handleResetRequest}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!phone.trim()}
            >
              Отправить код
            </Button>
          </div>
        </div>
      )}

      {/* Форма ввода кода восстановления */}
      {mode === 'resetCode' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="resetCode" className="text-sm font-medium text-gray-700">
              Код подтверждения
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Код отправлен на номер {phone}
            </p>
            <Input
              id="resetCode"
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="1234"
              maxLength={4}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setMode('reset')}
              className="flex-1"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button 
              onClick={handleResetCodeSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={resetCode.length !== 4}
            >
              Подтвердить
            </Button>
          </div>
        </div>
      )}

      {/* Форма установки нового пароля */}
      {mode === 'newPassword' && (
        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              Новый пароль
            </Label>
            <div className="mt-1 relative">
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
                className="pl-10"
                required
              />
              <Icon name="Lock" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700">
              Подтвердите пароль
            </Label>
            <div className="mt-1 relative">
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                className="pl-10"
                required
              />
              <Icon name="Lock" size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
            {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className="text-red-500 text-xs mt-1">Пароли не совпадают</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!newPassword.trim() || newPassword !== confirmNewPassword}
          >
            <Icon name="CheckCircle" size={16} className="mr-2" />
            Установить пароль
          </Button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;