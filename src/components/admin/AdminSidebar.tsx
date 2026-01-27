import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Store,
  Boxes,
  Receipt,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'dashboard', end: true },
  { path: '/admin/pos', icon: ShoppingCart, labelKey: 'pos_terminal' },
  { path: '/admin/products', icon: Package, labelKey: 'products' },
  { path: '/admin/inventory', icon: Boxes, labelKey: 'inventory' },
  { path: '/admin/sales', icon: Receipt, labelKey: 'sales_history' },
  { path: '/admin/reports', icon: BarChart3, labelKey: 'reports' },
  { path: '/admin/employee', icon: Users, labelKey: 'employee' },
  { path: '/admin/settings', icon: Settings, labelKey: 'settings' },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border shadow-2xl lg:shadow-none">
      {/* Logo & Close Button */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-sidebar-border shrink-0">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sidebar-foreground truncate">{t('app_name')}</h1>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">{t('admin_panel')}</p>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em]">Main Menu</span>
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'pos-sidebar-item-active' : 'pos-sidebar-item'
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="font-medium truncate">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile & Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30 group cursor-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold border border-sidebar-primary/20">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground truncate">Administrator</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">admin@ceylonpos.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full h-11 px-3 rounded-xl flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors font-semibold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
