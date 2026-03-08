import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface SupplierCardProps {
  supplier: any;
  onViewDetails: (supplier: any) => void;
}

const SupplierCard = ({ supplier, onViewDetails }: SupplierCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-l-4 border-l-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <img 
            src={supplier.logo} 
            alt={supplier.name}
            className="w-16 h-16 object-cover rounded-xl flex-shrink-0 ring-2 ring-gray-100"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                  {supplier.verified && (
                    <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Верифицирован
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs ml-auto">
                    {supplier.products} товаров
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Icon name="MapPin" size={12} className="mr-1" />
                    {supplier.region}
                  </span>
                  <span className="flex items-center">
                    <Icon name="Tag" size={12} className="mr-1" />
                    {supplier.category}
                  </span>
                  <span className="flex items-center">
                    <Icon name="Calendar" size={12} className="mr-1" />
                    {supplier.experience} лет
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{supplier.description}</p>

            <div className="flex items-center gap-6 mb-3 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Icon name="Package" size={14} className="text-primary" />
                <span className="font-medium">От {supplier.minOrder.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {supplier.specializations.slice(0, 2).map((spec: string) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <Icon name="Phone" size={12} className="mr-1" />
                  {supplier.phone}
                </span>
                <span className="flex items-center">
                  <Icon name="Mail" size={12} className="mr-1" />
                  {supplier.email}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Icon name="MessageCircle" size={14} className="mr-1" />
                  Написать
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onViewDetails(supplier)}
                  className="h-8 text-xs bg-primary hover:bg-primary/90"
                >
                  <Icon name="Eye" size={14} className="mr-1" />
                  Подробнее
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;