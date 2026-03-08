import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import Icon from "@/components/ui/icon";

interface SupplierFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;

  regionFilter: string;
  setRegionFilter: (value: string) => void;
  categories: string[];
  regions: string[];
  onResetFilters: () => void;
}

const SupplierFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  verifiedOnly,
  setVerifiedOnly,

  regionFilter,
  setRegionFilter,
  categories,
  regions,
  onResetFilters
}: SupplierFiltersProps) => {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Icon name="Filter" size={20} className="mr-2" />
            Фильтры
          </span>
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            <Icon name="RotateCcw" size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Поиск */}
        <div>
          <label className="text-sm font-medium mb-2 block">Поиск</label>
          <Input
            placeholder="Название или описание..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Категория */}
        <div>
          <label className="text-sm font-medium mb-2 block">Категория</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Регион */}
        <div>
          <label className="text-sm font-medium mb-2 block">Регион</label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Все регионы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все регионы</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>



        {/* Верифицированные */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={setVerifiedOnly}
          />
          <label htmlFor="verified" className="text-sm font-medium">
            Только верифицированные
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierFilters;