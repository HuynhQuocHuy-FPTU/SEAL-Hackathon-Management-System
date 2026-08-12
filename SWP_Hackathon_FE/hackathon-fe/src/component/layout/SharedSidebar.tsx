import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigateButton from '../button/NavigateButton';

export interface SidebarMenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  tabValue: string;
}

interface SharedSidebarProps {
  roleTitle: string;
  menuItems: SidebarMenuItem[];
  bottomItems?: SidebarMenuItem[];
  primaryCta?: ReactNode;
  activeTab?: string;
  defaultActiveTab?: string;
}

export default function SharedSidebar({
  roleTitle,
  menuItems,
  bottomItems = [],
  primaryCta,
  activeTab: propActiveTab,
  defaultActiveTab = 'overview',
}: SharedSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab if not explicitly provided
  const getActiveTab = () => {
    if (propActiveTab) return propActiveTab;
    
    // Exact match first
    const allItems = [...menuItems, ...bottomItems];
    const exactMatch = allItems.find(item => location.pathname === item.path);
    if (exactMatch) return exactMatch.tabValue;

    // Then prefix match, sorted by longest path
    const sortedItems = [...allItems].sort((a, b) => b.path.length - a.path.length);
    for (const item of sortedItems) {
      if (location.pathname.startsWith(item.path)) {
        return item.tabValue;
      }
    }
    return defaultActiveTab;
  };

  const currentActiveTab = getActiveTab();

    return (
    <aside className="fixed h-full w-70 bg-gray-200 backdrop-blur-[50px] border border-white/30 rounded-[15px] flex flex-col z-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden">
      {/* Brand Logo */}
      <div
        className="p-6 pb-4 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-orange-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg shadow-[0_4px_12px_rgba(0,88,190,0.2)] group-hover:shadow-[0_4px_20px_rgba(0,88,190,0.3)] transition-shadow overflow-hidden shrink-0 border border-white/20">
            {/* <img src={logoWhite} alt="SEAL Logo" className="w-7 h-7 object-contain" /> */}S
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-lg text-slate-800 tracking-tight leading-none group-hover:text-brand-primary transition-colors">SEAL</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 truncate">{roleTitle}</p>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      {primaryCta && (
        <div className="px-3 mb-4">
          {primaryCta}
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavigateButton
              key={item.tabValue}
              Icon={Icon}
              label={item.name}
              activeTab={currentActiveTab}
              tabValue={item.tabValue}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </nav>

      {/* Bottom Links */}
      {bottomItems.length > 0 && (
        <div className="border-t border-white/30 px-3 py-3 space-y-1 bg-white/10 backdrop-blur-md">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavigateButton
                key={item.tabValue}
                Icon={Icon}
                label={item.name}
                activeTab={currentActiveTab}
                tabValue={item.tabValue}
                onClick={() => navigate(item.path)}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}
