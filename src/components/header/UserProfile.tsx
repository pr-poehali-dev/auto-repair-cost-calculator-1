import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import UserTypeSelector from '@/components/auth/UserTypeSelector';

interface UserProfileProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const UserProfile = ({ isLoggedIn, setIsLoggedIn }: UserProfileProps) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(false);
  
  // Симуляция данных профиля
  const [profileData] = useState({
    name: "Иван Иванов",
    email: "ivan@company.ru",
    avatar: null, // null = нет аватарки
    profileComplete: 65, // процент заполнения
    hasCompanyCard: false, // есть ли карточка компании
    missingFields: ["Телефон", "Адрес компании", "Описание"]
  });

  return (
    <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
      {isLoggedIn && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate('/profile/company')}
          >
            <Icon name="LayoutDashboard" size={18} />
            <span className="hidden lg:inline">Кабинет поставщика</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => navigate('/cart')}
            data-cart-icon
          >
            <Icon name="ShoppingCart" size={20} />
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-white">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </>
      )}
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileData.avatar || "/avatars/user-profile.jpg"} alt="Профиль" />
                <AvatarFallback className="bg-primary text-white">
                  {profileData.avatar ? "ИИ" : <Icon name="User" size={16} />}
                </AvatarFallback>
              </Avatar>
              {!profileData.avatar && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <Icon name="User" size={16} className="mr-2" />
              <div className="flex flex-col space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{profileData.name}</p>
                  {!profileData.avatar && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Фото
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all" 
                      style={{ width: `${profileData.profileComplete}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{profileData.profileComplete}%</span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center cursor-pointer justify-between"
              onClick={() => navigate('/profile/company')}
            >
              <div className="flex items-center">
                <Icon name="Building2" size={16} className="mr-2" />
                Моя карточка компании
              </div>
              {!profileData.hasCompanyCard && (
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 border-orange-200">
                    Создать
                  </Badge>
                </div>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/orders')}
            >
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Мои заказы
            </DropdownMenuItem>
            {profileData.profileComplete < 100 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer"
                  onClick={() => navigate('/profile/complete')}
                >
                  <Icon name="AlertCircle" size={16} className="mr-2 text-orange-500" />
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm">Завершить профиль</span>
                    <span className="text-xs text-muted-foreground">
                      Осталось: {profileData.missingFields.join(", ")}
                    </span>
                  </div>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center cursor-pointer text-red-600"
              onClick={() => setIsLoggedIn(false)}
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs md:text-sm px-2 md:px-3"
            onClick={() => navigate('/login')}
          >
            <Icon name="LogIn" size={14} className="mr-1 md:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Войти</span>
            <span className="sm:hidden">Вход</span>
          </Button>
          <Button 
            size="sm" 
            className="text-xs md:text-sm px-2 md:px-3"
            onClick={() => setShowUserTypeSelector(true)}
          >
            <Icon name="UserPlus" size={14} className="mr-1 md:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Регистрация</span>
            <span className="sm:hidden">Рег.</span>
          </Button>
        </>
      )}
      
      {/* Селектор типа пользователя */}
      {showUserTypeSelector && (
        <UserTypeSelector onClose={() => setShowUserTypeSelector(false)} />
      )}
    </div>
  );
};

export default UserProfile;