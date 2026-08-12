import { Outlet } from 'react-router-dom';
import SidebarEventCoordinator from './SidebarEventCoordinator';
import TopNavbarPage from '../navbar/TopNavbarPage';
import { EventCoordinatorProvider, useEventCoordinator } from '../../context/EventCoordinatorContext';

// Inner layout component (needs access to context)
function EventCoordinatorInner() {
  const { event } = useEventCoordinator();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 antialiased flex">
      <SidebarEventCoordinator
        eventName={event.name}
      />
      <div className="flex-1 min-h-screen md:pl-70 flex flex-col">
        <div className="max-w-350 mx-auto w-full relative z-20">
          <TopNavbarPage />
        </div>
        <main className="p-6 md:p-8 flex-1 max-w-350 mx-auto w-full">
          <Outlet />
        </main>
      </div>
      {/* <EventCoordinatorModals /> */}
    </div>
  );
}

// Public layout export wraps everything with the Provider
export default function EventCoordinatorLayout() {
  return (
    <EventCoordinatorProvider>
      <EventCoordinatorInner />
    </EventCoordinatorProvider>
  );
}
