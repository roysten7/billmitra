import React, { useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const SubscriptionTestPage: React.FC = () => {
  const { 
    plans, 
    currentPlan, 
    subscription, 
    loading, 
    error,
    fetchPlans,
    fetchSubscription,
    isModuleEnabled,
    updateSubscription,
    cancelSubscription,
    formatPrice,
  } = useSubscription();

  // Test module access states
  const [moduleAccess, setModuleAccess] = React.useState<Record<string, boolean>>({});
  const [isTestingModules, setIsTestingModules] = React.useState(false);

  // Load initial data
  useEffect(() => {
    fetchPlans();
    
    if (subscription?.restaurant_id) {
      fetchSubscription(subscription.restaurant_id);
    }
  }, [fetchPlans, fetchSubscription, subscription?.restaurant_id]);

  // Test module access
  const testModuleAccess = async () => {
    if (!subscription?.restaurant_id) return;
    
    setIsTestingModules(true);
    try {
      const modules = ['billing', 'inventory', 'reports', 'analytics'];
      const accessResults: Record<string, boolean> = {};
      
      for (const moduleName of modules) {
        const hasAccess = await isModuleEnabled(moduleName);
        accessResults[moduleName] = hasAccess;
      }
      
      setModuleAccess(accessResults);
    } catch (error) {
      console.error('Error testing module access:', error);
    } finally {
      setIsTestingModules(false);
    }
  };

  // Handle subscription update (for testing)
  const handleUpgrade = async (planId: string) => {
    if (!subscription?.restaurant_id) return;
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 1); // 1 month from now
    
    try {
      await updateSubscription({
        planId,
        restaurantId: subscription.restaurant_id,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      // Refresh subscription data
      await fetchSubscription(subscription.restaurant_id);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  // Handle subscription cancellation (for testing)
  const handleCancel = async () => {
    if (!subscription?.id) return;
    
    try {
      await cancelSubscription(subscription.id);
      
      // Refresh subscription data
      if (subscription.restaurant_id) {
        await fetchSubscription(subscription.restaurant_id);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Subscription Management Test</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.subscription ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {currentPlan?.name || 'No Plan'}
                  </h3>
                  {currentPlan && (
                    <p className="text-muted-foreground">
                      {formatPrice(currentPlan.monthly_price)}
                      <span className="text-sm text-muted-foreground">/month</span>
                      {currentPlan.yearly_price > 0 && (
                        <span className="ml-2 text-sm">
                          or {formatPrice(currentPlan.yearly_price, 'yearly')}/year
                        </span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    {subscription.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Period:</span>{' '}
                    {new Date(subscription.start_date).toLocaleDateString()} -{' '}
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={testModuleAccess}
                    disabled={isTestingModules}
                    className="mr-2"
                  >
                    {isTestingModules ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      'Test Module Access'
                    )}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleCancel}
                    disabled={!subscription.is_active}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <p>No active subscription</p>
            )}
          </CardContent>
        </Card>
        
        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.plans ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </div>
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-muted-foreground">
                      {formatPrice(plan.monthly_price)}
                      <span className="text-sm text-muted-foreground">/month</span>
                      {plan.yearly_price > 0 && (
                        <span className="ml-2 text-sm">
                          or {formatPrice(plan.yearly_price, 'yearly')}/year
                        </span>
                      )}
                    </p>
                    <p className="text-sm mt-2">{plan.description}</p>
                    
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={currentPlan?.id === plan.id}
                        variant={currentPlan?.id === plan.id ? 'outline' : 'default'}
                        className="w-full"
                      >
                        {currentPlan?.id === plan.id ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No plans available</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Module Access Results */}
      {Object.keys(moduleAccess).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Module Access Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(moduleAccess).map(([moduleName, hasAccess]) => (
                <div key={moduleName} className="flex items-center">
                  {hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                  <span className="capitalize">{moduleName}:</span>
                  <span className={`ml-2 font-medium ${hasAccess ? 'text-green-600' : 'text-yellow-600'}`}>
                    {hasAccess ? 'Access Granted' : 'Access Denied'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTestPage;
