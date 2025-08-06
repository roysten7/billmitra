import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/routes';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import SubscriptionManagement from '@/pages/SubscriptionManagement';
import TestRoute from '@/pages/TestRoute';
import { SubscriptionTestPage } from '@/pages/SubscriptionTestPage';
import Restaurants from '@/pages/Restaurants';
import CreatePlan from '@/pages/admin/CreatePlan';
import EditPlan from '@/pages/admin/EditPlan';
import CreateRestaurant from '@/pages/admin/CreateRestaurant';
import EditRestaurant from '@/pages/admin/EditRestaurant';
import RestaurantSettings from '@/pages/admin/RestaurantSettings';
import OutletManagement from '@/pages/admin/OutletManagement';
import ModuleManagement from '@/pages/admin/ModuleManagement';
import { Toaster } from '@/components/ui/sonner';

// Create a wrapper for protected routes with MainLayout
const ProtectedLayout = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  console.log('ProtectedLayout - Rendering with allowedRoles:', allowedRoles);
  const roles = allowedRoles || ['super_admin', 'restaurant_admin', 'outlet_admin', 'staff'];
  
  return (
    <ProtectedRoute allowedRoles={roles}>
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
};

// Create a public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedLayout>
                <Navigate to="/dashboard" replace />
              </ProtectedLayout>
            } />
            <Route path="/dashboard" element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } />
            <Route path="/restaurants" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <Restaurants />
              </ProtectedLayout>
            } />
            <Route path="/restaurants/create" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <CreateRestaurant />
              </ProtectedLayout>
            } />
            <Route path="/restaurants/:id/edit" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <EditRestaurant />
              </ProtectedLayout>
            } />
            <Route path="/restaurants/:id/settings" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <RestaurantSettings />
              </ProtectedLayout>
            } />
            <Route path="/restaurants/:id/outlets" element={
              <ProtectedLayout allowedRoles={['super_admin', 'restaurant_admin']}>
                <OutletManagement />
              </ProtectedLayout>
            } />
            <Route path="/modules" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <ModuleManagement />
              </ProtectedLayout>
            } />
            <Route path="/subscription" element={
              <ProtectedLayout allowedRoles={['super_admin', 'restaurant_admin']}>
                <SubscriptionManagement />
              </ProtectedLayout>
            } />
            
            {/* Admin Plan Management Routes */}
            <Route path="/admin/plans/new" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <CreatePlan />
              </ProtectedLayout>
            } />
            <Route path="/admin/plans/:planId" element={
              <ProtectedLayout allowedRoles={['super_admin']}>
                <EditPlan />
              </ProtectedLayout>
            } />
            
            <Route path="/test-route" element={
              <ProtectedLayout allowedRoles={['super_admin', 'restaurant_admin']}>
                <TestRoute />
              </ProtectedLayout>
            } />
            
            {/* Test route - only accessible in development */}
            {import.meta.env.DEV && (
              <Route path="/test/subscription" element={
                <ProtectedLayout allowedRoles={['super_admin']}>
                  <SubscriptionTestPage />
                </ProtectedLayout>
              } />
            )}

            {/* Debug test route */}
            <Route path="/debug-test" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Debug Test Page</h1>
                <p>If you can see this, the routing is working correctly.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => console.log('Button clicked!')}
                >
                  Test Console Log
                </button>
              </div>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-lg">Page not found</p>
                  <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    Go back home
                  </a>
                </div>
              </div>
            } />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
