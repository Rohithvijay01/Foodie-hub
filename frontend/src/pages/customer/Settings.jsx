import { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Smartphone, Mail, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true,
    orderUpdates: true,
    promotions: false
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <Button 
            variant={activeTab === 'account' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('account')}
          >
            <User className="mr-2 h-4 w-4" /> Account
          </Button>
          <Button 
            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button 
            variant={activeTab === 'appearance' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('appearance')}
          >
            {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            Appearance
          </Button>
          <Button 
            variant={activeTab === 'security' ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab('security')}
          >
            <Shield className="mr-2 h-4 w-4" /> Security
          </Button>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal details here. For major changes, please contact the admin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input defaultValue={user?.full_name || ''} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Number</label>
                  <Input defaultValue={user?.registrationNumber || user?.register_number || ''} disabled className="bg-gray-50 dark:bg-gray-800/50" />
                  <p className="text-xs text-muted-foreground">Registration number cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input defaultValue={user?.mobile_number || ''} type="tel" />
                </div>
                <Button className="mt-4">Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Delivery Methods</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive real-time alerts in your browser</p>
                      </div>
                    </div>
                    <Switch checked={notifications.push} onCheckedChange={() => handleNotificationChange('push')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Email Alerts</p>
                        <p className="text-sm text-muted-foreground">Get daily summaries to your inbox</p>
                      </div>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={() => handleNotificationChange('email')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Important updates directly to your phone</p>
                      </div>
                    </div>
                    <Switch checked={notifications.sms} onCheckedChange={() => handleNotificationChange('sms')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Campus Bite looks on your device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800 bg-card">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle the dark theme for the application</p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-0 shadow-sm bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg dark:border-gray-800 bg-card/50 space-y-4">
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <Key className="w-4 h-4 text-primary" /> Change Password
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Current Password</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">New Password</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Confirm New Password</label>
                    <Input type="password" />
                  </div>
                  <Button variant="default" className="mt-2">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
