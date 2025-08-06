import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCircle, Crown, Zap } from 'lucide-react';
import { Plan } from '@/services/subscription.service';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  isYearly?: boolean;
  onSelect?: (plan: Plan) => void;
  buttonText?: string;
  loading?: boolean;
  features?: string[];
  highlight?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  isYearly = false,
  onSelect,
  buttonText = 'Get Started',
  loading = false,
  features = [],
  highlight = false,
}) => {
  const price = isYearly ? plan.yearly_price : plan.monthly_price;
  const period = isYearly ? 'year' : 'month';
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(isYearly ? plan.yearly_price : plan.monthly_price);

  // Calculate savings for yearly billing
  const yearlySavings = isYearly 
    ? Math.round(((plan.monthly_price * 12 - plan.yearly_price) / (plan.monthly_price * 12)) * 100)
    : 0;

  return (
    <Card 
      className={`w-full max-w-sm relative overflow-hidden transition-all duration-200 ${
        highlight 
          ? 'border-2 border-primary shadow-lg scale-105' 
          : 'hover:shadow-md hover:border-primary/50'
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium transform rotate-12 translate-x-8 translate-y-2">
          POPULAR
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {plan.name}
              {isCurrentPlan && (
                <Badge variant="outline" className="text-xs">
                  Current Plan
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.description || 'Ideal for getting started'}
            </p>
          </div>
          {plan.name.toLowerCase() === 'enterprise' && <Crown className="h-5 w-5 text-yellow-500" />}
          {plan.name.toLowerCase() === 'professional' && <Zap className="h-5 w-5 text-blue-500" />}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formattedPrice}</span>
            <span className="text-muted-foreground">/ {period}</span>
          </div>
          
          {isYearly && plan.monthly_price > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="line-through">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(plan.monthly_price * 12)}
              </span>{' '}
              <span className="text-green-600 font-medium">Save {yearlySavings}%</span>
            </p>
          )}
          
          {plan.name.toLowerCase() === 'free' && (
            <p className="text-sm text-muted-foreground mt-1">
              No credit card required
            </p>
          )}
        </div>
        
        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => onSelect?.(plan)}
          disabled={isCurrentPlan || loading}
        >
          {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
