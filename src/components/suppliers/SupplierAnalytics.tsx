import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface SupplierAnalyticsProps {
  suppliers: any[];
  regions: string[];
}

const SupplierAnalytics = ({ suppliers, regions }: SupplierAnalyticsProps) => {
  return (
    <div className="grid md:grid-cols-1 gap-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Распределение по регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regions.map(region => {
              const regionSuppliers = suppliers.filter(s => s.region === region);
              const percentage = (regionSuppliers.length / suppliers.length * 100).toFixed(1);
              
              return (
                <div key={region} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{region}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[40px]">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      

    </div>
  );
};

export default SupplierAnalytics;