import { useState } from 'react';

export function useTopNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const closeAllMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return {
    showNotifications,
    setShowNotifications,
    toggleNotifications,
    showProfileMenu,
    setShowProfileMenu,
    toggleProfileMenu,
    activeTab,
    setActiveTab,
    closeAllMenus,
  };
}
