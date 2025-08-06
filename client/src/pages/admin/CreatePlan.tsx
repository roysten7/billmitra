import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscription.service';
import { useAuth } from '@/hooks/useAuth';

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_price: 0,
    yearly_price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.monthly_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log('=== CREATE PLAN DEBUG ===');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('User email:', user?.email);
    console.log('Is authenticated:', !!user);
    console.log('Token exists:', !!localStorage.getItem('token'));

    try {
      setIsLoading(true);
      await subscriptionService.createPlan({
        name: formData.name,
        description: formData.description,
        monthly_price: formData.monthly_price,
        yearly_price: formData.yearly_price,
      });
      
      toast.success('Plan created successfully');
      navigate('/subscription');
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error('Failed to create plan', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/subscription')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscriptions
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Plan</h1>
          <p className="text-muted-foreground">
            Create a new subscription plan for restaurants
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Starter, Professional, Enterprise"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the plan features and benefits"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_price">Monthly Price (INR) *</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  min="0"
                  value={formData.monthly_price}
                  onChange={(e) => handleInputChange('monthly_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearly_price">Yearly Price (INR)</Label>
                <Input
                  id="yearly_price"
                  type="number"
                  min="0"
                  value={formData.yearly_price}
                  onChange={(e) => handleInputChange('yearly_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                {formData.monthly_price > 0 && formData.yearly_price > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Save {Math.round(((formData.monthly_price * 12 - formData.yearly_price) / (formData.monthly_price * 12)) * 100)}% with yearly billing
                  </p>
                )}
              </div>
            </div>



            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/subscription')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlan; 