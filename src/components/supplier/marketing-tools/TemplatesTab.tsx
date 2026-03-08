import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { EmailTemplate } from './types';

interface TemplatesTabProps {
  emailTemplate: string;
  setEmailTemplate: (template: string) => void;
}

export default function TemplatesTab({ emailTemplate, setEmailTemplate }: TemplatesTabProps) {
  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Приветствие нового клиента',
      subject: 'Добро пожаловать! Ваш первый заказ готов',
      content: `Здравствуйте, {customer_name}!

Спасибо за ваш заказ в нашем магазине. Мы очень рады видеть вас среди наших клиентов!

Ваш заказ #{order_number} на сумму {order_total} уже обрабатывается.

Как постоянному клиенту, предлагаем вам скидку 10% на следующую покупку по промокоду WELCOME10.

С уважением,
Команда {supplier_name}`
    },
    {
      id: 'abandoned-cart',
      name: 'Брошенная корзина',
      subject: 'Вы забыли что-то важное в корзине!',
      content: `Здравствуйте, {customer_name}!

Мы заметили, что вы добавили товары в корзину, но не завершили заказ.

В вашей корзине:
{cart_items}

Завершите покупку в течение 24 часов и получите бесплатную доставку!

{cart_link}

С уважением,
{supplier_name}`
    },
    {
      id: 'restock',
      name: 'Товар снова в наличии',
      subject: 'Отличные новости! {product_name} снова в наличии',
      content: `Здравствуйте, {customer_name}!

Спешим сообщить, что товар "{product_name}", который вас интересовал, снова доступен для заказа.

Успейте оформить заказ, пока товар в наличии!

{product_link}

С уважением,
{supplier_name}`
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Mail" size={20} />
            Email-шаблоны для клиентов
          </CardTitle>
          <CardDescription>
            Готовые шаблоны писем для различных ситуаций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm font-medium">
                    {template.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4 line-clamp-6">
                    {template.content}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Просмотр
                    </Button>
                    <Button size="sm" className="flex-1">
                      Использовать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Редактор шаблонов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Edit" size={20} />
            Создать свой шаблон
          </CardTitle>
          <CardDescription>
            Персонализированные письма для ваших клиентов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-subject">Тема письма</Label>
            <Input
              id="email-subject"
              placeholder="Специальное предложение для вас!"
            />
          </div>
          <div>
            <Label htmlFor="email-content">Текст письма</Label>
            <Textarea
              id="email-content"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="Здравствуйте, {customer_name}!&#10;&#10;У нас для вас специальное предложение..."
              rows={8}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Icon name="Eye" size={16} className="mr-2" />
              Предпросмотр
            </Button>
            <Button>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить шаблон
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}