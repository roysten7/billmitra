import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { subscriptionService } from '@/services/subscription.service';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('Error in SubscriptionManagement:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }

    return this.props.children;
  }
}

const SubscriptionManagementContent: React.FC = () => {
  console.log('=== SubscriptionManagement Component Mounted ===');
  
  // Simple test to see if component is rendering at all
  console.log('Component is rendering, testing basic content');
  
  const { user, isAuthenticated } = useAuth();
  console.log('Auth State:', { isAuthenticated, user });
  
  // Simple fallback to test if component is rendering
  if (!user) {
    console.log('No user found, showing loading state');
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Subscription Management</h1>
        <p>Loading user data...</p>
      </div>
    );
  }
  
  // Log component props and initial state
  useEffect(() => {
    console.log('SubscriptionManagement - Initial render');
    return () => {
      console.log('SubscriptionManagement - Unmounting');
    };
  }, []);
  
  // Log when user or auth state changes
  useEffect(() => {
    console.log('SubscriptionManagement - Auth state updated', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    planId: string | null;
    planName: string;
  }>({
    isOpen: false,
    planId: null,
    planName: '',
  });
  
  // Log component updates
  useEffect(() => {
    console.log('Component updated with state:', { 
      activeTab, 
      isLoading, 
      plansCount: plans.length, 
      subscription: !!subscription,
      currentPlan: !!currentPlan
    });
  }, [activeTab, isLoading, plans, subscription, currentPlan]);

  // Check if user is admin
  const isAdmin = user?.role === 'super_admin';
  
  // Handle case when user is not loaded
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  // Fetch subscription data
  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // For regular users, fetch their subscription
      if (!isAdmin && user?.restaurantId) {
        const sub = await subscriptionService.getRestaurantSubscription(user.restaurantId);
        setSubscription(sub);
        
        if (sub?.plan_id) {
          const plan = await subscriptionService.getPlanById(sub.plan_id);
          setCurrentPlan(plan);
        }
      }
      
      // For admins, fetch all plans
      if (isAdmin) {
        console.log('=== FETCHING PLANS FOR ADMIN ===');
        const allPlans = await subscriptionService.getPlans(false); // Get all plans including inactive
        console.log('Plans fetched:', allPlans);
        setPlans(allPlans);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast.error('Failed to load subscription data', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSubscriptionData();
  }, [user, isAdmin]);

  // Handle plan upgrade success
  const handleUpgradeSuccess = () => {
    fetchSubscriptionData();
    setActiveTab('my-subscription');
    toast.success('Subscription updated successfully');
  };

  // Handle plan creation (admin only)
  const handleCreatePlan = () => {
    navigate('/admin/plans/new');
  };

  // Handle plan edit (admin only)
  const handleEditPlan = (planId: string) => {
    navigate(`/admin/plans/${planId}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSubscriptionData();
    toast('Refreshing subscription data...');
  };

  // Handle plan deletion (admin only)
  const handleDeletePlan = (planId: string, planName: string) => {
    console.log('=== DELETE PLAN CLICKED ===');
    console.log('Plan ID:', planId);
    console.log('Plan Name:', planName);
    setDeleteDialog({
      isOpen: true,
      planId,
      planName,
    });
    console.log('Delete dialog state set to open');
  };

  const confirmDeletePlan = async () => {
    if (!deleteDialog.planId) return;
    
    try {
      await subscriptionService.deletePlan(deleteDialog.planId);
      await fetchSubscriptionData();
      toast.success('Plan deleted successfully');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('Failed to delete plan', {
        description: 'Please try again.',
      });
    } finally {
      setDeleteDialog({ isOpen: false, planId: null, planName: '' });
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? 'Subscription Management' : 'My Subscription'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Manage subscription plans and view restaurant subscriptions' 
              : 'View and manage your subscription plan'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {isAdmin ? (
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          ) : (
            <Button onClick={() => setIsUpgradeModalOpen(true)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              {subscription ? 'Change Plan' : 'Get Started'}
            </Button>
          )}
        </div>
      </div>

      {isAdmin ? (
        // Super Admin View - No tabs, just plan management
        <div className="space-y-8">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Plan Management</h2>
            <p className="text-muted-foreground mb-4">
              Manage all subscription plans. Click on a plan to edit its details.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditPlan(plan.id)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }).format(plan.monthly_price)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {plan.yearly_price ? (
                      <span>
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        }).format(plan.yearly_price)}
                        /year (save {Math.round(((plan.monthly_price * 12 - plan.yearly_price) / (plan.monthly_price * 12)) * 100)}%)
                      </span>
                    ) : 'Yearly billing not available'}
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id, plan.name);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                    >
                      Delete Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Restaurant Admin View - With tabs
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-subscription">My Subscription</TabsTrigger>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="my-subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : subscription ? (
                  <SubscriptionStatus 
                    restaurantId={user?.restaurantId || ''} 
                    showUpgradeButton={true}
                    onUpgrade={() => setActiveTab('plans')}
                  />
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active subscription</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have an active subscription. Choose a plan to get started.
                    </p>
                    <Button onClick={() => setActiveTab('plans')}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Choose the perfect plan</h2>
                <p className="text-xl text-muted-foreground">
                  Select the plan that fits your restaurant's needs. You can change or cancel anytime.
                </p>
              </div>
              
              <SubscriptionPlans 
                onSelectPlan={(plan) => {
                  setCurrentPlan(plan);
                  setIsUpgradeModalOpen(true);
                }}
                currentPlanId={subscription?.plan_id}
              />
              
              <div className="text-center text-sm text-muted-foreground mt-8">
                <p>Need a custom plan for your business? <a href="#" className="text-primary hover:underline">Contact sales</a></p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Upgrade/Change Plan Modal */}
      {user?.restaurantId && (
        <UpgradeModal
          open={isUpgradeModalOpen}
          onOpenChange={setIsUpgradeModalOpen}
          restaurantId={user.restaurantId}
          currentPlanId={subscription?.plan_id}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, planId: null, planName: '' })}
        onConfirm={confirmDeletePlan}
        title="Delete Plan"
        description={`Are you sure you want to delete the plan "${deleteDialog.planName}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isLoading}
      />
    </div>
  );
};

const SubscriptionManagement: React.FC = () => {
  console.log('=== SubscriptionManagement Component Rendered ===');
  return (
    <ErrorBoundary>
      <SubscriptionManagementContent />
    </ErrorBoundary>
  );
};

export default SubscriptionManagement;
