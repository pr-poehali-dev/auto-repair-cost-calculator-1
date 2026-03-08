import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/categories/CategoryCard";
import SearchBar from "@/components/categories/SearchBar";
import StatsDisplay from "@/components/categories/StatsDisplay";
import HeroSection from "@/components/categories/HeroSection";
import PopularCategories from "@/components/categories/PopularCategories";
import EmptyState from "@/components/categories/EmptyState";
import { categoriesData } from "@/data/categoriesData";

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categoriesData.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = categoriesData.reduce((sum, category) => sum + category.productCount, 0);
  const totalCategories = categoriesData.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="ml-64">
        <div className="container mx-auto px-6 py-8">
          <HeroSection 
            totalCategories={totalCategories} 
            totalProducts={totalProducts} 
          />

          <div className="mb-8 grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
            </div>
            <div className="lg:col-span-2">
              <StatsDisplay 
                totalCategories={totalCategories} 
                totalProducts={totalProducts} 
              />
            </div>
          </div>

          {searchQuery && (
            <div className="mb-6">
              <p className="text-gray-600">
                Найдено категорий: <span className="font-semibold text-indigo-600">{filteredCategories.length}</span>
              </p>
            </div>
          )}

          {filteredCategories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <EmptyState 
              searchQuery={searchQuery} 
              onClearSearch={() => setSearchQuery("")} 
            />
          )}

          {!searchQuery && (
            <PopularCategories categories={categoriesData} />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Categories;