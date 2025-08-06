import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Building2, 
  User,
  Key,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantService, Restaurant } from '@/services/restaurant.service';
import { useAuth } from '@/hooks/useAuth';

interface EditRestaurantForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
}

interface EditRestaurantAdminForm {
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

interface EditSubscriptionForm {
  plan_id: string;
  start_date: string;
  end_date: string;
  grace_period_days: number;
}

interface ResetPasswordForm {
  new_password: string;
  confirm_password: string;
}

const EditRestaurant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const [formData, setFormData] = useState<EditRestaurantForm>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'Asia/Kolkata',
  });

  const [adminFormData, setAdminFormData] = useState<EditRestaurantAdminForm>({
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [subscriptionFormData, setSubscriptionFormData] = useState<EditSubscriptionForm>({
    plan_id: '',
    start_date: '',
    end_date: '',
    grace_period_days: 7,
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordForm>({
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchSubscriptionPlans();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const data = await RestaurantService.getRestaurant(parseInt(id!));
      if (data) {
        setRestaurant(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          postal_code: data.postal_code || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          timezone: data.timezone || 'Asia/Kolkata',
        });
        setAdminFormData({
          admin_name: data.admin_name || '',
          admin_email: data.admin_email || '',
          admin_password: '',
        });
        setSubscriptionFormData({
          plan_id: data.plan_id ? data.plan_id.toString() : '',
          start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
          end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
          grace_period_days: data.grace_period_days || 7,
        });
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      toast.error('Failed to load restaurant details');
      navigate('/restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditRestaurantForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdminInputChange = (field: keyof EditRestaurantAdminForm, value: string) => {
    setAdminFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubscriptionInputChange = (field: keyof EditSubscriptionForm, value: string | number) => {
    setSubscriptionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const plans = await RestaurantService.getSubscriptionPlans();
      setSubscriptionPlans(plans || []);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Restaurant name is required');
      return;
    }

    try {
      setIsSaving(true);
      await RestaurantService.updateRestaurant(parseInt(id!), formData);
      toast.success('Restaurant updated successfully');
      navigate('/restaurants');
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      toast.error('Failed to update restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminFormData.admin_name || !adminFormData.admin_email) {
      toast.error('Admin name and email are required');
      return;
    }

    if (adminFormData.admin_password && adminFormData.admin_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSaving(true);
      await RestaurantService.updateRestaurantAdmin(parseInt(id!), adminFormData);
      toast.success('Restaurant admin updated successfully');
      fetchRestaurant(); // Refresh data
    } catch (error) {
      console.error('Failed to update restaurant admin:', error);
      toast.error('Failed to update restaurant admin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriptionFormData.plan_id || !subscriptionFormData.start_date || !subscriptionFormData.end_date) {
      toast.error('Plan, start date, and end date are required');
      return;
    }

    try {
      setIsSaving(true);
      await RestaurantService.updateRestaurantSubscription(parseInt(id!), subscriptionFormData);
      toast.success('Subscription updated successfully');
      fetchRestaurant(); // Refresh data
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetPasswordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsResettingPassword(true);
      await RestaurantService.resetRestaurantAdminPassword(parseInt(id!), resetPasswordData.new_password);
      toast.success('Password reset successfully');
      setShowResetPassword(false);
      setResetPasswordData({ new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Failed to reset password');
    } finally {
      setIsResettingPassword(false);
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

  if (isLoading) {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/restaurants')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Restaurants
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Restaurant</h1>
          <p className="text-muted-foreground">
            Update restaurant details and manage admin access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/restaurants/${id}/outlets`)}>
            <Building2 className="h-4 w-4 mr-2" />
            Outlets
          </Button>
          <Button variant="outline" onClick={() => navigate(`/restaurants/${id}/settings`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Reset Admin Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Restaurant Admin Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={resetPasswordData.new_password}
                    onChange={(e) => setResetPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={resetPasswordData.confirm_password}
                    onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isResettingPassword}>
                    {isResettingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Reset Password
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowResetPassword(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Restaurant Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Restaurant Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter restaurant name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/restaurants')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Restaurant Admin Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Restaurant Admin Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="admin_name">Admin Name *</Label>
                    <Input
                      id="admin_name"
                      value={adminFormData.admin_name}
                      onChange={(e) => handleAdminInputChange('admin_name', e.target.value)}
                      placeholder="Enter admin name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={adminFormData.admin_email}
                      onChange={(e) => handleAdminInputChange('admin_email', e.target.value)}
                      placeholder="Enter admin email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin_password">New Password (leave blank to keep current)</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={adminFormData.admin_password}
                    onChange={(e) => handleAdminInputChange('admin_password', e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    Update Admin
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Subscription Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubscription} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="plan_id">Subscription Plan *</Label>
                    <Select
                      value={subscriptionFormData.plan_id}
                      onValueChange={(value) => handleSubscriptionInputChange('plan_id', value)}
                      disabled={isLoadingPlans}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPlans ? "Loading plans..." : "Select a plan"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingPlans ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading plans...
                          </div>
                        ) : subscriptionPlans.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            No plans available
                          </div>
                        ) : (
                          subscriptionPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - ₹{plan.monthly_price}/month
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grace_period_days">Grace Period (days)</Label>
                    <Input
                      id="grace_period_days"
                      type="number"
                      value={subscriptionFormData.grace_period_days}
                      onChange={(e) => handleSubscriptionInputChange('grace_period_days', parseInt(e.target.value))}
                      placeholder="7"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={subscriptionFormData.start_date}
                      onChange={(e) => handleSubscriptionInputChange('start_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={subscriptionFormData.end_date}
                      onChange={(e) => handleSubscriptionInputChange('end_date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Update Subscription
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{restaurant.name}</span>
              </div>
              
              {restaurant.subscription_status && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Status: {getStatusBadge(restaurant.subscription_status)}</span>
                </div>
              )}

              {restaurant.plan_name && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <span className="font-medium">{restaurant.plan_name}</span>
                </div>
              )}

              {restaurant.admin_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Admin:</span>
                  <span className="font-medium">{restaurant.admin_name}</span>
                </div>
              )}

              {restaurant.admin_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.admin_email}</span>
                </div>
              )}

              {restaurant.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
              )}

              {restaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.phone}</span>
                </div>
              )}

              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.website}</span>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Created: {formatDate(restaurant.created_at)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Updated: {formatDate(restaurant.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant; 