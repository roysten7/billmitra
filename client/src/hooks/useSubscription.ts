import { useState, useEffect, useCallback } from 'react';
import { subscriptionService, Plan, PlanModule, Subscription } from '../services/subscription.service';
import { useAuth } from '../contexts/AuthContext';

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [modules, setModules] = useState<PlanModule[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState({
    plans: false,
    subscription: false,
    modules: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all available plans
  const fetchPlans = useCallback(async (activeOnly = true) => {
    try {
      setLoading(prev => ({ ...prev, plans: true }));
      setError(null);
      const data = await subscriptionService.getPlans(activeOnly);
      setPlans(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Failed to load subscription plans');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, plans: false }));
    }
  }, []);

  // Fetch current subscription for the authenticated restaurant
  const fetchSubscription = useCallback(async (restaurantId: string) => {
    if (!restaurantId) return null;
    
    try {
      setLoading(prev => ({ ...prev, subscription: true }));
      setError(null);
      const data = await subscriptionService.getRestaurantSubscription(restaurantId);
      setSubscription(data);
      
      // If there's a subscription, fetch the plan details
      if (data?.plan_id) {
        const planDetails = await subscriptionService.getPlanById(data.plan_id);
        setCurrentPlan(planDetails);
      }
      
      return data;
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError('Failed to load subscription details');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, subscription: false }));
    }
  }, []);

  // Fetch modules for a specific plan
  const fetchPlanModules = useCallback(async (planId: string) => {
    if (!planId) return [];
    
    try {
      setLoading(prev => ({ ...prev, modules: true }));
      setError(null);
      const data = await subscriptionService.getPlanModules(planId);
      setModules(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch plan modules:', err);
      setError('Failed to load plan modules');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, modules: false }));
    }
  }, []);

  // Check if a specific module is enabled for the current subscription
  const isModuleEnabled = useCallback(async (moduleName: string): Promise<boolean> => {
    if (!user?.restaurantId) return false;
    
    try {
      return await subscriptionService.checkModuleAccess(user.restaurantId, moduleName);
    } catch (err) {
      console.error(`Failed to check access for module ${moduleName}:`, err);
      return false;
    }
  }, [user?.restaurantId]);

  // Create or update a subscription
  const updateSubscription = useCallback(async (data: {
    planId: string;
    startDate: string;
    endDate: string;
    restaurantId: string;
  }) => {
    try {
      setLoading(prev => ({ ...prev, subscription: true }));
      setError(null);
      
      const subscriptionData = {
        restaurant_id: data.restaurantId,
        plan_id: data.planId,
        start_date: data.startDate,
        end_date: data.endDate,
      };
      
      const result = await subscriptionService.createSubscription(subscriptionData);
      await fetchSubscription(data.restaurantId);
      return result;
    } catch (err) {
      console.error('Failed to update subscription:', err);
      setError('Failed to update subscription');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, subscription: false }));
    }
  }, [fetchSubscription]);

  // Cancel a subscription
  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      setLoading(prev => ({ ...prev, subscription: true }));
      setError(null);
      
      const result = await subscriptionService.cancelSubscription(subscriptionId);
      if (user?.restaurantId) {
        await fetchSubscription(user.restaurantId);
      }
      return result;
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, subscription: false }));
    }
  }, [fetchSubscription, user?.restaurantId]);

  // Load initial data
  useEffect(() => {
    fetchPlans();
    
    if (user?.restaurantId) {
      fetchSubscription(user.restaurantId);
    }
  }, [fetchPlans, fetchSubscription, user?.restaurantId]);

  return {
    plans,
    currentPlan,
    modules,
    subscription,
    loading,
    error,
    fetchPlans,
    fetchSubscription,
    fetchPlanModules,
    updateSubscription,
    cancelSubscription,
    isModuleEnabled,
    formatPrice: subscriptionService.formatPrice,
    calculateYearlySavings: subscriptionService.calculateYearlySavings,
  };
}
