import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LogoShowcase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            ← На главную
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Логотипы Business Market
            </h1>
            <p className="text-gray-600 mt-2">
              Три варианта дизайна в зеленой цветовой гамме
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg border">
            <div className="bg-white rounded-lg p-8 mb-4 flex items-center justify-center min-h-[300px]">
              <img
                src="/img/3c6225a0-ffae-46df-84b3-37b833e80bee.jpg"
                alt="Логотип 1"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Вариант 1: Минималистичный
            </h3>
            <p className="text-gray-600 text-sm">
              Чистый геометрический дизайн с бизнес-символами
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border">
            <div className="bg-white rounded-lg p-8 mb-4 flex items-center justify-center min-h-[300px]">
              <img
                src="/img/81fc0ed8-6b11-402d-9048-0116ba26a8e4.jpg"
                alt="Логотип 2"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Вариант 2: Корпоративный
            </h3>
            <p className="text-gray-600 text-sm">
              Элегантный стиль с эмблемой и профессиональным видом
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border">
            <div className="bg-white rounded-lg p-8 mb-4 flex items-center justify-center min-h-[300px]">
              <img
                src="/img/4455f9ea-1266-4bb2-b0ca-3f7ddfc86aee.jpg"
                alt="Логотип 3"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Вариант 3: Технологичный
            </h3>
            <p className="text-gray-600 text-sm">
              Современный дизайн с градиентами и tech-эстетикой
            </p>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Особенности дизайна
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Цветовая схема:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Зеленая гамма в стиле Сбербанка</li>
                <li>Основной цвет: #22c55e</li>
                <li>Профессиональные оттенки</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Применение:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Масштабируются без потери качества</li>
                <li>Подходят для веба и печати</li>
                <li>Универсальны для разных носителей</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;