import Icon from "@/components/ui/icon";

interface NavigationItem {
  href: string;
  icon: string;
  label: string;
}

interface NavigationSectionProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  isActive: boolean;
  isMenuExpanded: boolean;
  openSection: string | null;
  sectionKey: string;
  badge?: string;
  badgeColor?: string;
  items?: NavigationItem[];
  isCollapsible?: boolean;
  isPremium?: boolean;
  onToggle?: () => void;
  checkIsActive: (path: string) => boolean;
}

const NavigationSection = ({ 
  title, 
  icon, 
  isExpanded, 
  isActive, 
  isMenuExpanded, 
  openSection,
  sectionKey,
  badge,
  badgeColor = "bg-blue-100 text-blue-600",
  items = [],
  isCollapsible = false,
  isPremium = false,
  onToggle,
  checkIsActive
}: NavigationSectionProps) => {
  
  const renderButton = () => (
    <button 
      onClick={onToggle}
      className={`group w-full flex items-center ${isMenuExpanded ? 'px-3 py-2.5' : 'p-2 justify-center'} rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
        isPremium 
          ? 'bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 border border-orange-200 text-orange-800 hover:from-yellow-200 hover:to-orange-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : isActive || openSection === sectionKey
          ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30' 
          : 'text-gray-800 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {isMenuExpanded ? (
        <>
          <div className="w-6 flex justify-center">
            <Icon 
              name={icon} 
              size={16} 
              className="font-medium transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
            />
          </div>
          <span className={`ml-3 flex-1 font-medium mr-2 leading-tight transition-all duration-300 ${
            isMenuExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            {title}
          </span>
        </>
      ) : (
        <Icon 
          name={icon} 
          size={16} 
          className="font-medium transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" 
        />
      )}
      {isMenuExpanded && isCollapsible && (
        <div className={`flex items-center space-x-2 ml-2 transition-all duration-500 ${
          isMenuExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          {badge && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-300 hover:scale-110 ${badgeColor}`}>
              {badge}
            </span>
          )}
          <Icon 
            name={openSection === sectionKey ? 'ChevronUp' : 'ChevronDown'} 
            size={16} 
            className={`transition-all duration-500 ease-out ${
              openSection === sectionKey ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
            }`}
          />
        </div>
      )}
      {isMenuExpanded && !isCollapsible && badge && (
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 transition-all duration-500 hover:scale-110 ${
          isMenuExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        } ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );

  const renderLink = () => (
    <a 
      href={items[0]?.href || "#"}
      className={`group flex items-center ${isMenuExpanded ? 'px-3 py-2.5' : 'p-2 justify-center'} rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
        isPremium 
          ? 'bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 border border-orange-200 text-orange-800 hover:from-yellow-200 hover:to-orange-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : isActive
          ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30' 
          : 'text-gray-800 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {isMenuExpanded ? (
        <>
          <div className="w-6 flex justify-center">
            <Icon 
              name={icon} 
              size={16} 
              className="font-medium transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
            />
          </div>
          <span className={`ml-3 font-medium leading-tight transition-all duration-300 ${
            isMenuExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            {title}
          </span>
        </>
      ) : (
        <Icon 
          name={icon} 
          size={16} 
          className="font-medium transition-all duration-300 group-hover:scale-125 group-hover:rotate-6" 
        />
      )}
      {isMenuExpanded && badge && (
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-auto transition-all duration-500 hover:scale-110 ${
          isMenuExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        } ${badgeColor}`}>
          {badge}
        </span>
      )}
    </a>
  );

  return (
    <div className="transition-all duration-300 hover:translate-x-1">
      <div className="space-y-1">
        {isCollapsible ? renderButton() : renderLink()}
        
        {isCollapsible && openSection === sectionKey && isMenuExpanded && (
          <div 
            className="space-y-0.5 ml-6 overflow-hidden"
            style={{
              animation: 'slideDownFadeIn 0.4s ease-out forwards',
              transformOrigin: 'top'
            }}
          >
            {items.map((item, index) => (
              <a 
                key={index}
                href={item.href} 
                className={`group flex items-center space-x-2.5 px-2 py-1.5 rounded-md transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] ${
                  checkIsActive(item.href) 
                    ? 'bg-primary/20 text-primary shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary hover:shadow-sm'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInLeft 0.3s ease-out forwards'
                }}
              >
                <Icon 
                  name={item.icon} 
                  size={14} 
                  className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                {isMenuExpanded && (
                  <span className="text-sm font-normal leading-tight transition-all duration-300">
                    {item.label}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationSection;