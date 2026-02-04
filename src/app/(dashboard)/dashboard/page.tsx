import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Users, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active API keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick start guide for your new application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">1. Create an API Key</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to API Keys to generate your first API key for programmatic access.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">2. Test the API</h3>
            <p className="text-sm text-muted-foreground">
              Use your API key to authenticate requests to the API endpoints.
            </p>
            <pre className="mt-2 rounded bg-muted p-2 text-xs">
              curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \{'\n'}
              {'  '}http://localhost:3000/api/auth/me
            </pre>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">3. Build Your Features</h3>
            <p className="text-sm text-muted-foreground">
              Extend the application by adding new features following the Clean Architecture pattern.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
