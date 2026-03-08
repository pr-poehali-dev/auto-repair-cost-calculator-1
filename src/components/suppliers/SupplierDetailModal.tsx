import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";

interface SupplierDetailModalProps {
  supplier: any;
  onClose: () => void;
}

const SupplierDetailModal = ({ supplier, onClose }: SupplierDetailModalProps) => {
  if (!supplier) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={supplier.logo} alt={supplier.name} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
              <p className="text-gray-600">{supplier.category} • {supplier.region}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
              <TabsTrigger value="contact">Контакты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">

                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Package" size={20} className="text-blue-500" />
                      <span className="font-semibold text-lg">{supplier.products}</span>
                    </div>
                    <p className="text-sm text-gray-600">Товарных позиций</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Calendar" size={20} className="text-green-500" />
                      <span className="font-semibold text-lg">{supplier.experience}</span>
                    </div>
                    <p className="text-sm text-gray-600">Лет на рынке</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">О компании</h3>
                  <p className="text-gray-700">{supplier.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Основная информация</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Год основания:</span>
                        <span>{supplier.foundedYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Сотрудников:</span>
                        <span>{supplier.employeesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Заказов в месяц:</span>
                        <span>{supplier.monthlyOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Мин. заказ:</span>
                        <span>{supplier.minOrder.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Преимущества</h4>
                    <ul className="space-y-1 text-sm">
                      {supplier.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Icon name="Check" size={14} className="text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Контактная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Icon name="Phone" size={16} />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Mail" size={16} />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Globe" size={16} />
                      <span>{supplier.website}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" size={16} className="mt-1" />
                      <span>{supplier.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Clock" size={16} />
                      <span>{supplier.workingHours}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Реквизиты</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ИНН:</span>
                      <span>{supplier.inn}</span>
                    </div>
                    {supplier.ogrn && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ОГРН:</span>
                        <span>{supplier.ogrn}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Регион доставки:</span>
                      <span>{supplier.deliveryRegions.join(", ")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;