export type UserRole = 'super_admin' | 'restaurant_admin' | 'outlet_admin' | 'staff';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles: UserRole[];
  title: string;
  icon?: React.ReactNode;
  children?: RouteConfig[];
}
