import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This is a placeholder for account settings. You can extend this page to include:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Profile information (name, email)</li>
              <li>Password change</li>
              <li>Two-factor authentication</li>
              <li>Session management</li>
              <li>Notification preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
