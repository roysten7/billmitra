import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building2, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantService, Restaurant } from '@/services/restaurant.service';
import { useAuth } from '@/hooks/useAuth';

const Restaurants: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await RestaurantService.getRestaurants();
      setRestaurants(data || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      toast.error('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRestaurant = () => {
    navigate('/restaurants/create');
  };

  const handleEditRestaurant = (id: number) => {
    navigate(`/restaurants/${id}/edit`);
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      await RestaurantService.deleteRestaurant(id);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
      toast.error('Failed to delete restaurant');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage restaurant accounts and subscriptions
          </p>
        </div>
        <Button onClick={handleCreateRestaurant}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !restaurants || restaurants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first restaurant.
            </p>
            <Button onClick={handleCreateRestaurant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.subscription_status && (
                      <div className="mt-2">
                        {getStatusBadge(restaurant.subscription_status)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRestaurant(restaurant.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      disabled={isDeleting === restaurant.id}
                    >
                      {isDeleting === restaurant.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Restaurant Details */}
                <div className="space-y-2">
                  {restaurant.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  
                  {restaurant.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.email}</span>
                    </div>
                  )}
                  
                  {restaurant.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.website}</span>
                    </div>
                  )}
                </div>

                {/* Subscription Details */}
                {restaurant.plan_name && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Subscription Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">{restaurant.plan_name}</span>
                      </div>
                      {restaurant.plan_price && (
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">₹{restaurant.plan_price}</span>
                        </div>
                      )}
                      {restaurant.start_date && (
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span>{formatDate(restaurant.start_date)}</span>
                        </div>
                      )}
                      {restaurant.end_date && (
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span>{formatDate(restaurant.end_date)}</span>
                        </div>
                      )}
                      {restaurant.grace_period_days && (
                        <div className="flex justify-between">
                          <span>Grace Period:</span>
                          <span>{restaurant.grace_period_days} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Details */}
                {restaurant.admin_name && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Restaurant Admin</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.admin_name}</span>
                      {restaurant.admin_email && (
                        <span className="text-gray-500 truncate">({restaurant.admin_email})</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants; 