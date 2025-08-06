import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCard } from './PlanCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionPlans: React.FC<{
  onSelectPlan?: (plan: any) => void;
  currentPlanId?: string | null;
  showTabs?: boolean;
  className?: string;
}> = ({ onSelectPlan, currentPlanId, showTabs = true, className = '' }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { 
    plans, 
    loading, 
    error, 
    fetchPlans,
    currentPlan
  } = useSubscription();

  // Filter out the current plan from the list if currentPlanId is provided
  const filteredPlans = currentPlanId 
    ? plans.filter(plan => plan.id !== currentPlanId)
    : plans;

  // Sort plans by price
  const sortedPlans = [...filteredPlans].sort((a, b) => 
    (billingCycle === 'monthly' ? a.monthly_price - b.monthly_price : a.yearly_price - b.yearly_price)
  );

  // Highlight the middle plan if there are 3 or more plans
  const highlightIndex = sortedPlans.length >= 3 ? Math.floor(sortedPlans.length / 2) : -1;

  const handleRetry = () => {
    fetchPlans();
  };

  if (loading.plans && plans.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No subscription plans available at the moment.</p>
      </div>
    );
  }

  const renderPlans = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedPlans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={plan.id === currentPlanId}
          isYearly={billingCycle === 'yearly'}
          onSelect={onSelectPlan}
          buttonText={onSelectPlan ? 'Select Plan' : 'Current Plan'}
          loading={loading.subscription}
          highlight={index === highlightIndex}
          features={getPlanFeatures(plan.name)}
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      {showTabs ? (
        <Tabs 
          defaultValue="monthly" 
          className="space-y-6"
          onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
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
          <TabsContent value="monthly">
            {renderPlans()}
          </TabsContent>
          <TabsContent value="yearly">
            {renderPlans()}
          </TabsContent>
        </Tabs>
      ) : (
        renderPlans()
      )}
    </div>
  );
};

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

export default SubscriptionPlans;
