import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Building2, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantService, CreateRestaurantWithSubscriptionInput } from '@/services/restaurant.service';
import { subscriptionService } from '@/services/subscription.service';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [formData, setFormData] = useState<CreateRestaurantWithSubscriptionInput>({
    // Restaurant details
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
    
    // Subscription details
    plan_id: '',
    start_date: '',
    end_date: '',
    grace_period_days: 7,
    
    // Restaurant admin details
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  // Load subscription plans
  useEffect(() => {
    const loadSubscriptionPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const plans = await subscriptionService.getPlans();
        setSubscriptionPlans(plans.filter(plan => plan.is_active));
      } catch (error) {
        console.error('Failed to load subscription plans:', error);
        toast.error('Failed to load subscription plans');
        setSubscriptionPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    loadSubscriptionPlans();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.plan_id || formData.plan_id === '' || !formData.start_date || !formData.end_date || 
        !formData.admin_name || !formData.admin_email || !formData.admin_password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }

    if (formData.admin_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await RestaurantService.createRestaurantWithSubscription(formData);
      toast.success('Restaurant created successfully');
      navigate('/restaurants');
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      toast.error('Failed to create restaurant', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/restaurants')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Restaurants
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Restaurant</h1>
          <p className="text-muted-foreground">
            Add a new restaurant with subscription and admin account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Restaurant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="restaurant@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the restaurant"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="Postal code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan_id">Subscription Plan *</Label>
                <Select
                  value={formData.plan_id || ''}
                  onValueChange={(value) => handleInputChange('plan_id', value)}
                  disabled={isLoadingPlans}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPlans ? "Loading plans..." : "Select a plan"} />
                  </SelectTrigger>
                  <SelectContent className="z-50">
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

              <div className="space-y-2">
                <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
                <Input
                  id="grace_period_days"
                  type="number"
                  min="0"
                  value={formData.grace_period_days}
                  onChange={(e) => handleInputChange('grace_period_days', parseInt(e.target.value) || 7)}
                  placeholder="7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Admin Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Restaurant Admin Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Admin Name *</Label>
                <Input
                  id="admin_name"
                  value={formData.admin_name}
                  onChange={(e) => handleInputChange('admin_name', e.target.value)}
                  placeholder="Admin name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@restaurant.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_password">Admin Password *</Label>
              <Input
                id="admin_password"
                type="password"
                value={formData.admin_password}
                onChange={(e) => handleInputChange('admin_password', e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
              <p className="text-sm text-muted-foreground">
                This will be the login credentials for the restaurant admin
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Restaurant...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Restaurant
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/restaurants')}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRestaurant; 