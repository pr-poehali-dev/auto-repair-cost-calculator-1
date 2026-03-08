import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Supplier {
  id: number;
  name: string;
  inn: string;
  category: string;
  region: string;
  verified: boolean;

  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface SuppliersMapProps {
  suppliers: any[];
}

const SuppliersMap = ({ suppliers }: SuppliersMapProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Координаты городов России для поставщиков
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Москва': { lat: 55.7558, lng: 37.6176 },
    'Санкт-Петербург': { lat: 59.9311, lng: 30.3609 },
    'Новосибирск': { lat: 55.0084, lng: 82.9357 },
    'Екатеринбург': { lat: 56.8431, lng: 60.6454 },
    'Казань': { lat: 55.8304, lng: 49.0661 },
    'Воронеж': { lat: 51.6720, lng: 39.1843 },
    'Нижний Новгород': { lat: 56.2965, lng: 43.9361 },
    'Краснодар': { lat: 45.0355, lng: 38.9753 },
    'Челябинск': { lat: 55.1644, lng: 61.4368 },
    'Омск': { lat: 54.9885, lng: 73.3242 }
  };

  // Преобразуем поставщиков с координатами
  const mappedSuppliers: Supplier[] = suppliers.map(supplier => ({
    ...supplier,
    coordinates: cityCoordinates[supplier.region] || { lat: 55.7558, lng: 37.6176 }
  }));

  // Функции управления масштабированием
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Обработка перетаскивания карты
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPan(prev => ({
      x: prev.x + deltaX / zoom,
      y: prev.y + deltaY / zoom
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // SVG карта России с масштабированием
  const RussiaMapSVG = () => {
    const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`;
    
    return (
      <div className="relative overflow-hidden border rounded-lg bg-blue-50" style={{ height: '500px' }}>
        {/* Элементы управления картой */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <Icon name="Plus" size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <Icon name="Minus" size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView}>
            <Icon name="RotateCcw" size={16} />
          </Button>
        </div>

        <svg 
          ref={svgRef}
          viewBox="0 0 800 400" 
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={transform}>
            {/* Фон карты */}
            <rect width="800" height="400" fill="#e0f2fe" />
            
            {/* Упрощенный контур России */}
            <path
              d="M 50 150 
                 L 120 120
                 L 200 110
                 L 320 115
                 L 450 120
                 L 580 125
                 L 700 130
                 L 750 140
                 L 780 160
                 L 770 200
                 L 750 250
                 L 720 280
                 L 680 290
                 L 600 295
                 L 500 290
                 L 400 285
                 L 300 280
                 L 200 275
                 L 120 270
                 L 80 250
                 L 50 200
                 Z"
              fill="#10b981"
              fillOpacity="0.3"
              stroke="#047857"
              strokeWidth="2"
            />

            {/* Отметки поставщиков на карте */}
            {mappedSuppliers.map((supplier, index) => {
              // Преобразуем координаты в пиксели SVG
              const svgX = ((supplier.coordinates.lng - 19) / (180 - 19)) * 700 + 50;
              const svgY = ((70 - supplier.coordinates.lat) / (70 - 41)) * 250 + 50;
              
              // Смещение для множественных поставщиков в одном городе
              const citySuppliers = mappedSuppliers.filter(s => s.region === supplier.region);
              const supplierIndex = citySuppliers.findIndex(s => s.id === supplier.id);
              const offsetX = (supplierIndex % 3 - 1) * 15;
              const offsetY = Math.floor(supplierIndex / 3) * 15;
              
              const finalX = svgX + offsetX;
              const finalY = svgY + offsetY;
              
              return (
                <g key={supplier.id}>
                  {/* Маркер поставщика */}
                  <circle
                    cx={finalX}
                    cy={finalY}
                    r={selectedSupplier?.id === supplier.id ? 12 : 8}
                    fill={supplier.verified ? '#10b981' : '#f59e0b'}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:opacity-80 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplier(supplier);
                    }}
                  />
                  
                  {/* Название компании */}
                  {zoom >= 1.2 && (
                    <g>
                      <rect
                        x={finalX - 40}
                        y={finalY - 35}
                        width="80"
                        height="20"
                        fill="white"
                        fillOpacity="0.9"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        rx="4"
                      />
                      <text
                        x={finalX}
                        y={finalY - 22}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-800 pointer-events-none"
                      >
                        {supplier.name.length > 12 ? supplier.name.substring(0, 12) + '...' : supplier.name}
                      </text>
                    </g>
                  )}
                  
                  {/* ИНН при большом масштабе */}
                  {zoom >= 2 && (
                    <g>
                      <rect
                        x={finalX - 25}
                        y={finalY + 18}
                        width="50"
                        height="16"
                        fill="#f3f4f6"
                        fillOpacity="0.9"
                        stroke="#d1d5db"
                        strokeWidth="1"
                        rx="3"
                      />
                      <text
                        x={finalX}
                        y={finalY + 29}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 pointer-events-none"
                      >
                        ИНН: {supplier.inn}
                      </text>
                    </g>
                  )}
                  
                  {/* Регион при малом масштабе */}
                  {zoom < 1.2 && (
                    <text
                      x={finalX}
                      y={finalY + 20}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700 pointer-events-none"
                    >
                      {supplier.region}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="MapPin" size={20} className="mr-2" />
              Интерактивная карта поставщиков России
            </div>
            <div className="text-sm text-gray-600">
              Масштаб: {(zoom * 100).toFixed(0)}%
            </div>
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Верифицированные</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Не верифицированные</span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              Перетаскивайте карту • Используйте кнопки +/- для масштаба
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Карта */}
            <div className="lg:col-span-2">
              <RussiaMapSVG />
            </div>
            
            {/* Информация о выбранном поставщике */}
            <div className="lg:col-span-1">
              {selectedSupplier ? (
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {selectedSupplier.name}
                          {selectedSupplier.verified && (
                            <Badge variant="default" className="text-xs">
                              <Icon name="CheckCircle" size={12} className="mr-1" />
                              Верифицирован
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedSupplier.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          ИНН: {selectedSupplier.inn}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSupplier(null)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm">
                        <Icon name="MapPin" size={14} className="mr-2" />
                        {selectedSupplier.region}
                      </span>

                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Icon name="Phone" size={14} className="mr-2 text-gray-400" />
                        <span>{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="Mail" size={14} className="mr-2 text-gray-400" />
                        <span className="text-xs">{selectedSupplier.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Icon name="MessageCircle" size={14} className="mr-1" />
                        Написать
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Icon name="Eye" size={14} className="mr-1" />
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-fit">
                  <CardContent className="p-6 text-center">
                    <Icon name="MousePointer" size={32} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Выберите поставщика на карте
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Кликните на точку на карте, чтобы увидеть информацию о поставщике
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Увеличьте масштаб для просмотра названий компаний</p>
                      <p>• При большом масштабе отображается ИНН</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика по регионам */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика по регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              mappedSuppliers.reduce((acc, supplier) => {
                acc[supplier.region] = (acc[supplier.region] || 0) + 1;
                return acc;
              }, {} as { [key: string]: number })
            )
              .sort(([,a], [,b]) => b - a)
              .map(([region, count]) => (
                <div key={region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="MapPin" size={16} className="mr-2 text-gray-600" />
                    <span className="font-medium">{region}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersMap;