import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock data для заказов
  const orders = [
    {
      id: "ORD-001",
      productName: "Офисная бумага А4",
      category: "Канцелярия",
      quantity: 500,
      price: 25000,
      supplier: "ОфисСнаб",
      status: "delivered",
      date: "2024-08-20",
      image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg"
    },
    {
      id: "ORD-002", 
      productName: "Компьютерные мыши",
      category: "Техника",
      quantity: 25,
      price: 75000,
      supplier: "ТехПоставка",
      status: "processing",
      date: "2024-08-22",
      image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg"
    },
    {
      id: "ORD-003",
      productName: "Кофе молотый",
      category: "Продукты",
      quantity: 100,
      price: 15000,
      supplier: "КофеПро",
      status: "pending",
      date: "2024-08-24",
      image: "/img/1896fbdf-f98d-49a3-9193-25c98958adcf.jpg"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-100 text-green-800">Доставлен</Badge>;
      case "processing":
        return <Badge variant="secondary">В обработке</Badge>;
      case "pending":
        return <Badge variant="outline">Ожидает</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || order.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Все заказы</h1>
          <p className="text-gray-600">Управление и отслеживание корпоративных закупок</p>
        </div>

        {/* Фильтры */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="Filter" size={20} className="mr-2" />
              Фильтры поиска
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Поиск по товару/поставщику</label>
                <Input
                  placeholder="Введите название..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Статус заказа</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="processing">В обработке</SelectItem>
                    <SelectItem value="delivered">Доставлен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="Канцелярия">Канцелярия</SelectItem>
                    <SelectItem value="Техника">Техника</SelectItem>
                    <SelectItem value="Продукты">Продукты</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Период</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Весь период" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Весь период</SelectItem>
                    <SelectItem value="today">Сегодня</SelectItem>
                    <SelectItem value="week">За неделю</SelectItem>
                    <SelectItem value="month">За месяц</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список заказов */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={order.image} 
                      alt={order.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{order.productName}</h3>
                      <p className="text-sm text-gray-600">Поставщик: {order.supplier}</p>
                      <p className="text-sm text-gray-500">Заказ #{order.id} • {order.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Количество</p>
                      <p className="font-semibold">{order.quantity} шт.</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Сумма</p>
                      <p className="font-semibold text-lg">{order.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-2">Статус</p>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" size={16} className="mr-2" />
                      Подробнее
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Icon name="ShoppingBag" size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Заказы не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
            </CardContent>
          </Card>
        )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Orders;