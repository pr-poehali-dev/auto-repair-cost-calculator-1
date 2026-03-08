import Logo from "@/components/ui/logo";
import NavigationSection from "./NavigationSection";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface SidebarNavigationProps {
  isMenuExpanded: boolean;
  isMobile: boolean;
  openSection: string | null;
  toggleSection: (section: string) => void;
  isActive: (path: string) => boolean;
  setIsHovered: (value: boolean) => void;
  isPinned: boolean;
  setIsPinned: (value: boolean) => void;
}

const SidebarNavigation = ({ 
  isMenuExpanded, 
  isMobile, 
  openSection, 
  toggleSection, 
  isActive, 
  setIsHovered,
  isPinned,
  setIsPinned
}: SidebarNavigationProps) => {
  
  const ordersItems = [
    { href: "/orders", icon: "List", label: "Все заказы" },
    { href: "/orders/pending", icon: "Clock", label: "В ожидании" },
    { href: "/orders/processing", icon: "Package", label: "В обработке" },
    { href: "/orders/completed", icon: "CheckCircle", label: "Выполненные" },
    { href: "/analytics", icon: "TrendingUp", label: "Аналитика продаж" }
  ];

  const catalogItems = [
    { href: "/catalog", icon: "List", label: "Все товары" },
    { href: "/catalog/categories", icon: "FolderOpen", label: "Категории" }
  ];

  const suppliersItems = [
    { href: "/suppliers", icon: "Users", label: "Поставщики" }
  ];

  return (
    <nav 
      className={`fixed left-0 top-0 bottom-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-[9999] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
        isMenuExpanded ? 'w-52 translate-x-0' : 'w-12 translate-x-0'
      } hover:shadow-3xl`}
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
      }}

    >
      {/* Заголовок */}
      <div className="py-3 px-3 border-b border-gray-200/30 flex items-center justify-center bg-gradient-to-r from-gray-50/80 to-white/60 relative backdrop-blur-sm">
        <div className="transition-transform duration-500 ease-out">
          <Logo isCollapsed={!isMenuExpanded} />
        </div>
      </div>
      
      {/* Основное меню */}
      <div className="px-2 py-2 flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`space-y-1 transition-all duration-500 ${
          isMenuExpanded ? 'animate-fade-in-up' : 'opacity-70'
        }`}>
          {/* Главная */}
          <NavigationSection
            title="Главная"
            icon="Home"
            isExpanded={false}
            isActive={isActive('/')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="home"
            items={[{ href: "/", icon: "Home", label: "Главная" }]}
            checkIsActive={isActive}
          />

          {/* Товары */}
          <NavigationSection
            title="Товары"
            icon="Grid3x3"
            isExpanded={openSection === 'catalog'}
            isActive={isActive('/catalog')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="catalog"
            badge="2.5k"
            badgeColor="bg-blue-100 text-blue-600"
            items={catalogItems}
            isCollapsible={true}
            onToggle={() => toggleSection('catalog')}
            checkIsActive={isActive}
          />

          {/* Заказы */}
          <NavigationSection
            title="Заказы"
            icon="ShoppingBag"
            isExpanded={openSection === 'orders'}
            isActive={isActive('/orders')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="orders"
            badge="24"
            badgeColor="bg-red-100 text-red-600"
            items={ordersItems}
            isCollapsible={true}
            onToggle={() => toggleSection('orders')}
            checkIsActive={isActive}
          />

          {/* Поставщики */}
          <NavigationSection
            title="Поставщики"
            icon="Users"
            isExpanded={false}
            isActive={isActive('/suppliers')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="suppliers"
            items={suppliersItems}
            checkIsActive={isActive}
          />

          {/* Новости */}
          <NavigationSection
            title="Новости"
            icon="Newspaper"
            isExpanded={false}
            isActive={isActive('/news')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="news"
            badge="Новое"
            badgeColor="bg-green-100 text-green-600"
            items={[{ href: "/news", icon: "Newspaper", label: "Новости" }]}
            checkIsActive={isActive}
          />

          {/* Тарифы */}
          <NavigationSection
            title="Тарифы"
            icon="Crown"
            isExpanded={false}
            isActive={isActive('/pricing')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="pricing"
            badge="Premium"
            badgeColor="bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border border-orange-300 font-semibold"
            isPremium={true}
            items={[{ href: "/pricing", icon: "Crown", label: "Тарифы" }]}
            checkIsActive={isActive}
          />

          {/* Контакты */}
          <NavigationSection
            title="Контакты"
            icon="Phone"
            isExpanded={false}
            isActive={isActive('/contacts')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="contacts"
            items={[{ href: "/contacts", icon: "Phone", label: "Контакты" }]}
            checkIsActive={isActive}
          />

          {/* Настройки */}
          <NavigationSection
            title="Настройки"
            icon="Settings"
            isExpanded={false}
            isActive={isActive('/settings')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="settings"
            items={[{ href: "/settings", icon: "Settings", label: "Настройки" }]}
            checkIsActive={isActive}
          />

          {/* Помощь */}
          <NavigationSection
            title="Помощь"
            icon="HelpCircle"
            isExpanded={false}
            isActive={isActive('/help')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="help"
            items={[{ href: "/help", icon: "HelpCircle", label: "Помощь" }]}
            checkIsActive={isActive}
          />

          {/* О компании */}
          <NavigationSection
            title="О компании"
            icon="Info"
            isExpanded={false}
            isActive={isActive('/about')}
            isMenuExpanded={isMenuExpanded}
            openSection={openSection}
            sectionKey="about"
            items={[{ href: "/about", icon: "Info", label: "О компании" }]}
            checkIsActive={isActive}
          />
        </div>


      </div>
    </nav>
  );
};

export default SidebarNavigation;