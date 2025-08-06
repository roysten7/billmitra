import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  console.log('MainLayout - Rendering with children:', !!children);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('MainLayout - Toggling sidebar');
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    console.log('MainLayout - Closing sidebar');
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-screen max-w-none overflow-x-hidden">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 w-screen max-w-none mt-16">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={closeSidebar}
          />
        )}
        
        <main className="flex-1 overflow-y-auto focus:outline-none w-full p-0 ml-0 md:ml-64 md:min-w-0 md:max-w-none pt-4">
          <div className="w-full h-full p-4 max-w-none">
            {(() => {
              console.log('MainLayout - Rendering Outlet');
              try {
                const outlet = <Outlet />;
                console.log('Outlet rendered:', outlet);
                return children || outlet;
              } catch (error) {
                console.error('Error rendering Outlet:', error);
                return (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h3 className="font-bold text-red-800">Error rendering content:</h3>
                    <pre className="text-xs text-red-700">
                      {error instanceof Error ? error.message : String(error)}
                    </pre>
                  </div>
                );
              }
            })()}
          </div>
        </main>
      </div>
    </div>
  );
};
