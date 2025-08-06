import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock, Zap, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SubscriptionStatus: React.FC<{
  restaurantId?: string;
  className?: string;
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
}> = ({ restaurantId, className = '', showUpgradeButton = true, onUpgrade }) => {
  const { 
    subscription, 
    currentPlan, 
    loading, 
    error, 
    fetchSubscription,
    isModuleEnabled
  } = useSubscription();

  const handleRetry = () => {
    if (restaurantId) {
      fetchSubscription(restaurantId);
    }
  };

  if (loading.subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load subscription details</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!subscription || !currentPlan) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          {showUpgradeButton && (
            <Button onClick={onUpgrade}>
              <Zap className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription.is_active && new Date(subscription.end_date) >= new Date();
  const daysRemaining = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (!isActive) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Renews in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'professional':
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {currentPlan.name}
              {getPlanIcon(currentPlan.name)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              {currentPlan.name !== 'Free' && (
                <Badge variant="outline">
                  {subscription.plan_id === currentPlan.id ? 'Current Plan' : 'Downgrade Pending'}
                </Badge>
              )}
            </div>
          </div>
          {showUpgradeButton && (
            <Button variant="outline" size="sm" onClick={onUpgrade}>
              Change Plan
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Billing Cycle</h4>
            <p className="font-medium">
              {subscription.yearly_price ? 'Yearly' : 'Monthly'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Next Billing Date</h4>
            <p className="font-medium">
              {format(new Date(subscription.end_date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
            <p className="font-medium">
              {isActive 
                ? `Active (${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining)` 
                : 'Expired'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
            <p className="font-medium">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(subscription.yearly_price || subscription.monthly_price)}
              <span className="text-muted-foreground text-sm ml-1">
                / {subscription.yearly_price ? 'year' : 'month'}
              </span>
            </p>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Included Features</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {getPlanFeatures(currentPlan.name).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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

export default SubscriptionStatus;
