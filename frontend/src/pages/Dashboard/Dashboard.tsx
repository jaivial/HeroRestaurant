import { Card, CardContent } from '@/components/ui';
import { useDashboardData } from './hooks/useDashboardData';

export function Dashboard() {
  const { stats, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass rounded-apple p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-content-primary">
          Dashboard
        </h1>
        <p className="text-content-secondary mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-secondary">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-content-primary mt-2">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-apple-blue/10 rounded-apple">
                <svg
                  className="w-8 h-8 text-apple-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-secondary">
                  Active Orders
                </p>
                <p className="text-3xl font-bold text-content-primary mt-2">
                  {stats.activeOrders}
                </p>
              </div>
              <div className="p-3 bg-apple-green/10 rounded-apple">
                <svg
                  className="w-8 h-8 text-apple-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-secondary">
                  Completed
                </p>
                <p className="text-3xl font-bold text-content-primary mt-2">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="p-3 bg-apple-purple/10 rounded-apple">
                <svg
                  className="w-8 h-8 text-apple-purple"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-content-secondary">
                  Revenue
                </p>
                <p className="text-3xl font-bold text-content-primary mt-2">
                  ${stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-apple-orange/10 rounded-apple">
                <svg
                  className="w-8 h-8 text-apple-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-content-primary mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <p className="text-content-secondary text-center py-8">
                No recent activity to display
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-content-primary mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 glass-subtle rounded-apple hover:glass transition-all duration-250 ease-apple text-left">
                <svg
                  className="w-6 h-6 text-apple-blue mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="font-medium text-content-primary">
                  New Order
                </p>
              </button>

              <button className="p-4 glass-subtle rounded-apple hover:glass transition-all duration-250 ease-apple text-left">
                <svg
                  className="w-6 h-6 text-apple-green mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-medium text-content-primary">
                  Manage Tables
                </p>
              </button>

              <button className="p-4 glass-subtle rounded-apple hover:glass transition-all duration-250 ease-apple text-left">
                <svg
                  className="w-6 h-6 text-apple-purple mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <p className="font-medium text-content-primary">
                  View Menu
                </p>
              </button>

              <button className="p-4 glass-subtle rounded-apple hover:glass transition-all duration-250 ease-apple text-left">
                <svg
                  className="w-6 h-6 text-apple-orange mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="font-medium text-content-primary">
                  View Reports
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
