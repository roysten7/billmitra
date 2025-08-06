import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your restaurant today.
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-medium leading-none">Today's Orders</h3>
          <p className="text-3xl font-bold mt-2">24</p>
          <p className="text-sm text-muted-foreground">+12% from yesterday</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-medium leading-none">Revenue</h3>
          <p className="text-3xl font-bold mt-2">₹12,540</p>
          <p className="text-sm text-muted-foreground">+8% from yesterday</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-medium leading-none">Active Tables</h3>
          <p className="text-3xl font-bold mt-2">8/15</p>
          <p className="text-sm text-muted-foreground">+3 from yesterday</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-medium leading-none">Popular Item</h3>
          <p className="text-xl font-bold mt-2">Butter Chicken</p>
          <p className="text-sm text-muted-foreground">32 orders today</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 md:col-span-4">
          <h3 className="font-medium leading-none mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Order #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Table {i + 3} • 30 mins ago</p>
                </div>
                <span className="font-medium">₹{i * 250 + 500}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 md:col-span-3">
          <h3 className="font-medium leading-none mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <span className="text-sm font-medium">New Order</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">Add Staff</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm0 4h12v2H6zm0 4h12v2H6zm0 4h12v2H6z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">View Menu</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">Feedback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
