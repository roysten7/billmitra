import React from 'react';

const TestSubscriptionPage: React.FC = () => {
  console.log('=== TestSubscriptionPage Rendered ===');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Subscription Page</h1>
      <p>If you can see this, the routing is working!</p>
    </div>
  );
};

export default TestSubscriptionPage;
