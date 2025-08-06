import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, ArrowRight, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  currentPlanId?: string | null;
  onUpgradeSuccess?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onOpenChange,
  restaurantId,
  currentPlanId,
  onUpgradeSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    plans, 
    loading, 
    subscription,
    updateSubscription,
    formatPrice,
    calculateYearlySavings,
  } = useSubscription();

  const filteredPlans = plans.filter(plan => plan.id !== currentPlanId);
  const currentPlan = plans.find(plan => plan.id === currentPlanId);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(selectedPlan === planId ? null : planId);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;
    
    setIsSubmitting(true);
    
    try {
      const today = new Date();
      const endDate = new Date(today);
      
      // Set end date to 1 month or 1 year from now based on billing cycle
      if (billingCycle === 'yearly') {
        endDate.setFullYear(today.getFullYear() + 1);
      } else {
        endDate.setMonth(today.getMonth() + 1);
      }
      
      await updateSubscription({
        planId: selectedPlan,
        restaurantId,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      toast.success('Subscription updated successfully!', {
        description: `You are now on the ${plan.name} plan.`,
      });
      
      onOpenChange(false);
      onUpgradeSuccess?.();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast.error('Failed to update subscription', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanPrice = (plan: any) => {
    return billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
  };

  const isUpgrade = (planId: string) => {
    if (!currentPlan) return true;
    const currentPlanPrice = billingCycle === 'yearly' 
      ? currentPlan.yearly_price 
      : currentPlan.monthly_price;
    const selectedPlanPrice = billingCycle === 'yearly'
      ? plans.find(p => p.id === planId)?.yearly_price || 0
      : plans.find(p => p.id === planId)?.monthly_price || 0;
    return selectedPlanPrice > currentPlanPrice;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that's right for your restaurant. You can change or cancel anytime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Tabs 
            defaultValue="monthly" 
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                <TabsTrigger value="yearly">
                  <div className="flex items-center gap-2">
                    <span>Yearly Billing</span>
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      Save up to 20%
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteringPlans(plans, currentPlanId).map((plan) => {
                const price = getPlanPrice(plan);
                const isCurrentPlan = plan.id === currentPlanId;
                const isSelected = selectedPlan === plan.id;
                const upgrade = isUpgrade(plan.id);
                
                return (
                  <div 
                    key={plan.id}
                    className={`relative rounded-lg border p-6 transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:border-primary/50 hover:shadow-md'
                    } ${isCurrentPlan ? 'opacity-75' : ''}`}
                    onClick={() => !isCurrentPlan && handlePlanSelect(plan.id)}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Current Plan
                        </span>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {formatPrice(price, billingCycle)}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      {billingCycle === 'yearly' && plan.monthly_price > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="line-through">
                            {formatPrice(plan.monthly_price * 12, 'yearly')}
                          </span>
                          {' '}
                          <span className="text-green-600 font-medium">
                            Save {calculateYearlySavings(plan.monthly_price, plan.yearly_price)}%
                          </span>
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {getPlanFeatures(plan.name).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {!isCurrentPlan ? (
                      <Button 
                        className="w-full"
                        variant={isSelected ? 'default' : 'outline'}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && selectedPlan === plan.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        {upgrade ? 'Upgrade Now' : 'Downgrade'}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Tabs>
          
          <div className="mt-8 flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              disabled={!selectedPlan || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {selectedPlan && isUpgrade(selectedPlan) ? 'Upgrade Plan' : 'Change Plan'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to filter and sort plans
export function filteringPlans(plans: any[], currentPlanId?: string | null) {
  // Filter out the current plan
  const filtered = currentPlanId 
    ? plans.filter(plan => plan.id !== currentPlanId)
    : [...plans];
  
  // Sort by monthly price
  return [...filtered].sort((a, b) => a.monthly_price - b.monthly_price);
}

// Helper function to get features based on plan name
function getPlanFeatures(planName: string): string[] {
  const baseFeatures = [
    'Unlimited bills & invoices',
    'Basic customer support',
    'Email notifications',
  ];

  const planFeatures: Record<string, string[]> = {
    'Free': [
      ...baseFeatures,
      'Up to 50 bills per month',
      'Basic reporting',
    ],
    'Starter': [
      ...baseFeatures,
      'Up to 500 bills per month',
      'Advanced reporting',
      'WhatsApp bill sharing',
      'Basic inventory management',
    ],
    'Professional': [
      ...baseFeatures,
      'Unlimited bills',
      'Advanced analytics',
      'Priority support',
      'Full inventory management',
      'Staff accounts',
      'Custom branding',
    ],
    'Enterprise': [
      ...baseFeatures,
      'Unlimited everything',
      '24/7 priority support',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'Onboarding & training',
    ],
  };

  return planFeatures[planName] || baseFeatures;
}

export default UpgradeModal;
