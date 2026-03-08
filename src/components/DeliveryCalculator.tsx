import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const DeliveryCalculator = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weight, setWeight] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [result, setResult] = useState<{ cost: number; days: string } | null>(null);

  const calculateDelivery = () => {
    if (!from || !to || !weight || !deliveryType) return;

    // Простой расчет стоимости доставки
    const baseRate = deliveryType === "express" ? 200 : deliveryType === "standard" ? 150 : 100;
    const weightMultiplier = parseFloat(weight) * 10;
    const cost = baseRate + weightMultiplier;
    
    const days = deliveryType === "express" ? "1-2 дня" : 
                 deliveryType === "standard" ? "3-5 дней" : "5-10 дней";

    setResult({ cost, days });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calculator" size={20} />
          Калькулятор доставки
        </CardTitle>
        <CardDescription>
          Рассчитайте стоимость и сроки доставки вашего груза
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from">Откуда</Label>
          <Input
            id="from"
            placeholder="Город отправления"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to">Куда</Label>
          <Input
            id="to"
            placeholder="Город назначения"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Вес (кг)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Тип доставки</Label>
          <Select value={deliveryType} onValueChange={setDeliveryType}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип доставки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Экономная</SelectItem>
              <SelectItem value="standard">Стандартная</SelectItem>
              <SelectItem value="express">Экспресс</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={calculateDelivery} className="w-full">
          <Icon name="Calculator" size={16} className="mr-2" />
          Рассчитать
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800">Стоимость: {result.cost} ₽</p>
                <p className="text-sm text-green-600">Срок: {result.days}</p>
              </div>
              <Icon name="Truck" size={24} className="text-green-600" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryCalculator;