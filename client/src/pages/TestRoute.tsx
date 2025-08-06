import React, { useEffect } from 'react';

const TestRoute: React.FC = () => {
  useEffect(() => {
    console.log('=== TestRoute Component Mounted ===');
    return () => {
      console.log('=== TestRoute Component Unmounted ===');
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Route</h1>
      <p>If you can see this, the routing is working correctly!</p>
      <p className="mt-4 p-4 bg-green-100 border border-green-200 rounded">
        Check the browser console for component lifecycle logs.
      </p>
    </div>
  );
};

export default TestRoute;
