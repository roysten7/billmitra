import { Home, Utensils, Users, Package, FileText, Settings, ChevronRight, User, CreditCard, Building2, Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type MenuItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  onClick?: () => void;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const handleSubscriptionClick = () => {
    console.log('Subscription menu item clicked');
    // Close the mobile menu if it's open
    if (isOpen) {
      onClose();
    }
  };

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Restaurants', icon: Building2, path: '/restaurants' },
    { name: 'Orders', icon: Utensils, path: '/orders' },
    { name: 'Menu', icon: FileText, path: '/menu' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Staff', icon: Users, path: '/staff' },
    { 
      name: 'Subscription', 
      icon: CreditCard, 
      path: '/subscription', 
      onClick: handleSubscriptionClick 
    },
    { name: 'Modules', icon: Layers, path: '/modules' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];
  return (
    <aside 
      className={`fixed top-16 left-0 z-20 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out bottom-0`}
    >
      <div className="flex flex-col h-full">
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-2">
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={item.onClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center p-2 rounded-lg bg-gray-50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@billmitra.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
