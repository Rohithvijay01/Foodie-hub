import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Store, Bike, FileText, CheckCircle2, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

const MOCK_REGISTRATION_REQUESTS = [
  { id: "REQ-001", name: "South Block Cafe", owner: "Ramesh Kumar", type: "Beverages", location: "Academic Block", date: "Today" },
  { id: "REQ-002", name: "Healthy Bites", owner: "Priya Singh", type: "Salads & Juices", location: "Girls Hostel", date: "Yesterday" }
];

export default function AdminDashboard() {
  const [requests, setRequests] = useState(MOCK_REGISTRATION_REQUESTS);

  const handleAction = (id, action) => {
    setRequests(requests.filter(r => r.id !== id));
    // Simulated API call to approve/reject
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">University Administrator Portal</h1>
        <p className="text-muted-foreground mt-1">Manage the entire Campus Bite ecosystem.</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">+12%</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-3xl font-bold">4,821</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                <Store className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">+2</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Canteens</p>
              <h3 className="text-3xl font-bold">14</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                <Bike className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">Stable</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Delivery Staff</p>
              <h3 className="text-3xl font-bold">32</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-orange-400/10 dark:from-primary/20 dark:to-orange-900/20">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/50 dark:bg-black/20 rounded-full flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
              <h3 className="text-3xl font-bold">₹1.2M</h3>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
          <TabsTrigger value="requests" className="relative">
            Pending Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="canteens">Canteens</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="outline-none">
          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
            <CardHeader>
              <CardTitle>Canteen Registration Requests</CardTitle>
              <CardDescription>Review and approve vendors wanting to join Campus Bite.</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p>All caught up! No pending requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req, i) => (
                    <motion.div 
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-xl dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-4"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                          <Store className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{req.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{req.owner}</span> • <span>{req.location}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="font-normal">{req.type}</Badge>
                            <span className="text-xs text-muted-foreground">Requested {req.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full md:w-auto gap-2">
                        <Button variant="outline" className="flex-1 md:flex-none text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(req.id, 'reject')}>
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, 'approve')}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="outline-none">
          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                User management table will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="canteens" className="outline-none">
          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
            <CardHeader>
              <CardTitle>Active Canteens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Active canteens list will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
