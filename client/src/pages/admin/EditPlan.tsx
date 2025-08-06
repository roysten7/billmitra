import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscription.service';

const EditPlan: React.FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    planName: string;
  }>({
    isOpen: false,
    planName: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_price: 0,
    yearly_price: 0,
    is_active: true,
  });

  // Load plan data
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;
      
      try {
        setIsLoading(true);
        const planData = await subscriptionService.getPlanById(planId);
        setPlan(planData);
        setFormData({
          name: planData.name,
          description: planData.description || '',
          monthly_price: planData.monthly_price,
          yearly_price: planData.yearly_price,
          is_active: planData.is_active,
        });
      } catch (error) {
        console.error('Failed to load plan:', error);
        toast.error('Failed to load plan details');
        navigate('/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [planId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.monthly_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await subscriptionService.updatePlan({
        id: planId!,
        name: formData.name,
        description: formData.description,
        monthly_price: formData.monthly_price,
        yearly_price: formData.yearly_price,
        is_active: formData.is_active,
      });
      
      toast.success('Plan updated successfully');
      navigate('/subscription');
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast.error('Failed to update plan', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialog({
      isOpen: true,
      planName: formData.name,
    });
  };

  const confirmDelete = async () => {
    if (!planId) return;
    
    try {
      setIsDeleting(true);
      await subscriptionService.deletePlan(planId);
      toast.success('Plan deleted successfully');
      navigate('/subscription');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('Failed to delete plan', {
        description: 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, planName: '' });
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading && !plan) {
    return (
      <div className="w-full h-full p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p>Loading plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="w-full h-full p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
          <p className="text-muted-foreground mb-4">The plan you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/subscription')}>
            Back to Subscriptions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/subscription')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscriptions
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
          <p className="text-muted-foreground">
            Update subscription plan details
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

            <div className="flex items-center space-x-2">
              <CustomSwitch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active Plan</Label>
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
                    Updating Plan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Plan
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

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, planName: '' })}
        onConfirm={confirmDelete}
        title="Delete Plan"
        description={`Are you sure you want to delete the plan "${deleteDialog.planName}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EditPlan; 