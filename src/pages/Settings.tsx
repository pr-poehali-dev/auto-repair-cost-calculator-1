import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SettingsData {
  notifications: boolean;
  autoRefresh: boolean;
  priceAlerts: boolean;
  maxPrice: number[];
  notificationFrequency: string;
  deliveryRegion: string;
  companyName: string;
  companyInn: string;
  companyPhone: string;
}

const defaultSettings: SettingsData = {
  notifications: true,
  autoRefresh: false,
  priceAlerts: true,
  maxPrice: [50000],
  notificationFrequency: "daily",
  deliveryRegion: "moscow",
  companyName: "",
  companyInn: "",
  companyPhone: ""
};

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('businessMarketSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({...defaultSettings, ...parsed});
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    }
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(defaultSettings);
    setHasChanges(changed);
  }, [settings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('businessMarketSettings', JSON.stringify(settings));
      setHasChanges(false);
      alert('✅ Настройки успешно сохранены!');
    } catch (error) {
      alert('❌ Ошибка сохранения настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('businessMarketSettings');
      setHasChanges(false);
      alert('🔄 Настройки сброшены к умолчанию');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-market-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('📥 Настройки экспортированы в файл!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="ml-56 transition-all duration-300">
        <section className="py-16 sm:py-20 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Icon name="Settings" size={14} className="mr-1" />
                Персональные настройки
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Настройки платформы
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Настройте работу платформы под ваши потребности и предпочтения
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Уведомления */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Bell" size={20} />
                    Уведомления
                  </CardTitle>
                  <CardDescription>
                    Управление системой уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Включить уведомления</Label>
                      <div className="text-sm text-gray-500">
                        Получать уведомления о новых предложениях
                      </div>
                    </div>
                    <Switch 
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="price-alerts">Ценовые уведомления</Label>
                      <div className="text-sm text-gray-500">
                        Уведомления об изменении цен
                      </div>
                    </div>
                    <Switch 
                      id="price-alerts"
                      checked={settings.priceAlerts}
                      onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Частота уведомлений</Label>
                    <Select 
                      value={settings.notificationFrequency} 
                      onValueChange={(value) => updateSetting('notificationFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">В реальном времени</SelectItem>
                        <SelectItem value="hourly">Каждый час</SelectItem>
                        <SelectItem value="daily">Ежедневно</SelectItem>
                        <SelectItem value="weekly">Еженедельно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Торговые настройки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Торговые настройки
                  </CardTitle>
                  <CardDescription>
                    Параметры для поиска и торговли
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Максимальная цена товара (₽)</Label>
                    <div className="px-3">
                      <Slider
                        value={settings.maxPrice}
                        onValueChange={(value) => updateSetting('maxPrice', value)}
                        max={1000000}
                        min={1000}
                        step={5000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>1,000₽</span>
                        <span className="font-medium text-primary">{settings.maxPrice[0].toLocaleString()}₽</span>
                        <span>1,000,000₽</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Регион поставки</Label>
                    <Select 
                      value={settings.deliveryRegion} 
                      onValueChange={(value) => updateSetting('deliveryRegion', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moscow">Москва и МО</SelectItem>
                        <SelectItem value="spb">Санкт-Петербург</SelectItem>
                        <SelectItem value="russia">Вся Россия</SelectItem>
                        <SelectItem value="cis">СНГ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-refresh">Автообновление каталога</Label>
                      <div className="text-sm text-gray-500">
                        Обновлять список товаров автоматически
                      </div>
                    </div>
                    <Switch 
                      id="auto-refresh"
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Профиль компании */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Building" size={20} />
                    Профиль компании
                  </CardTitle>
                  <CardDescription>
                    Информация о вашей компании
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Название компании</Label>
                    <Input 
                      id="company-name" 
                      placeholder="ООО 'Ваша компания'" 
                      value={settings.companyName}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-inn">ИНН</Label>
                    <Input 
                      id="company-inn" 
                      placeholder="1234567890" 
                      value={settings.companyInn}
                      onChange={(e) => updateSetting('companyInn', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Телефон</Label>
                    <Input 
                      id="company-phone" 
                      placeholder="+7 (999) 123-45-67" 
                      value={settings.companyPhone}
                      onChange={(e) => updateSetting('companyPhone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Безопасность */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Shield" size={20} />
                    Безопасность
                  </CardTitle>
                  <CardDescription>
                    Настройки безопасности аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => alert('🔐 Функция смены пароля будет доступна в следующем обновлении')}>
                    <Icon name="Key" size={16} className="mr-2" />
                    Изменить пароль
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => alert('📱 Настройка 2FA будет доступна в следующем обновлении')}>
                    <Icon name="Smartphone" size={16} className="mr-2" />
                    Двухфакторная аутентификация
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={exportData}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспортировать данные
                  </Button>

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full" onClick={() => {
                      if (confirm('⚠️ Вы действительно хотите удалить аккаунт? Это действие необратимо!')) {
                        alert('🗑️ Функция удаления аккаунта будет доступна в следующем обновлении');
                      }
                    }}>
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Удалить аккаунт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Кнопки управления */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button 
                size="lg" 
                className="text-base h-12" 
                onClick={saveSettings}
                disabled={!hasChanges || isLoading}
              >
                <Icon name="Save" size={18} className="mr-2" />
                {isLoading ? 'Сохранение...' : 'Сохранить все настройки'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base h-12"
                onClick={resetSettings}
                disabled={isLoading}
              >
                <Icon name="RotateCcw" size={18} className="mr-2" />
                Сбросить к умолчанию
              </Button>
            </div>
            
            {hasChanges && (
              <div className="text-center mt-6">
                <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
                  <Icon name="AlertTriangle" size={16} className="mr-2" />
                  У вас есть несохраненные изменения
                </div>
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Settings;