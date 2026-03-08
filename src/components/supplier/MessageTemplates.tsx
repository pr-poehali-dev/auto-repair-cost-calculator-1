import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function MessageTemplates() {
  const templates = [
    {
      title: 'Подтверждение заказа',
      text: 'Здравствуйте! Ваш заказ #{orderNumber} принят в работу. Ожидаемое время выполнения: 1-2 дня.',
      category: 'confirmation'
    },
    {
      title: 'Заказ готов к отправке',
      text: 'Отличные новости! Ваш заказ #{orderNumber} упакован и готов к отправке. Трек-номер: {trackingNumber}',
      category: 'shipping'
    },
    {
      title: 'Извинения за задержку',
      text: 'Приносим извинения за задержку заказа #{orderNumber}. Новая дата отправки: {newDate}. Спасибо за понимание!',
      category: 'delay'
    },
    {
      title: 'Запрос отзыва',
      text: 'Здравствуйте! Как вам товар из заказа #{orderNumber}? Будем благодарны за отзыв на нашем сайте.',
      category: 'review'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileText" size={20} />
          Шаблоны сообщений
        </CardTitle>
        <CardDescription>
          Готовые шаблоны для общения с клиентами
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-4">
                <h4 className="font-medium text-gray-900 mb-2">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.text}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Изменить</Button>
                  <Button size="sm">Использовать</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}