import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, ShoppingBag, Clock, TrendingUp, CheckCircle2, User, XCircle, MapPin, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/services/notificationService';

// Fallback Mock Data if API is disconnected
const MOCK_LIVE_ORDERS = [
  { 
    id: "ORD-9432", 
    studentName: "Rahul Sharma",
    regNumber: "22BCE1234",
    department: "Computer Science",
    items: [{ name: "Chicken Biryani", quantity: 2 }, { name: "Coke", quantity: 2 }], 
    total: 280, 
    dest: "Hostel Block C, Room 312", 
    status: "pending", 
    time: "10:42 AM" 
  },
  { 
    id: "ORD-9433", 
    studentName: "Sneha Reddy",
    regNumber: "21BME4567",
    department: "Mechanical",
    items: [{ name: "Veg Thali", quantity: 1 }], 
    total: 80, 
    dest: "CS Block, Lab 4", 
    status: "preparing", 
    time: "10:30 AM" 
  },
];

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState(MOCK_LIVE_ORDERS);
  const [isOpen, setIsOpen] = useState(true);
  const [stats, setStats] = useState({ revenueToday: 1450, ordersToday: 12, averagePrepTime: "12m" });
  
  const { notifications, isConnected } = useNotifications();
  const { toast } = useToast();

  // Listen for real-time SSE notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.event === 'new_order') {
        const newOrder = {
          id: `ORD-${Math.floor(Math.random() * 10000)}`,
          studentName: "New Student",
          regNumber: "23BXX0000",
          department: "Unknown",
          items: [{ name: "New Item", quantity: 1 }],
          total: 100,
          dest: "Campus Area",
          status: "pending",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setOrders(prev => [newOrder, ...prev]);
        toast({
          title: "New Order Received!",
          description: "A student just placed an order.",
          variant: "default",
        });
      }
    }
  }, [notifications, toast]);

  const handleUpdateStatus = (id, newStatus) => {
    // TODO: Connect this to actual backend API
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    if (newStatus === 'rejected') {
      toast({ title: "Order Rejected", description: "The student has been notified." });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-red-500 text-white';
      case 'preparing': return 'bg-orange-500 text-white';
      case 'ready': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-gray-500 text-white';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Canteen Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage live orders, monitor revenue, and control operations.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-[#1f2028] p-3 rounded-xl shadow-sm border dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} ${isOpen && 'animate-pulse'}`} />
            <span className="font-semibold">{isOpen ? 'Accepting Orders' : 'Canteen Closed'}</span>
          </div>
          <Switch checked={isOpen} onCheckedChange={setIsOpen} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-200 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-700 dark:text-orange-400">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
              <h3 className="text-2xl font-bold">₹{stats.revenueToday}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
              <h3 className="text-2xl font-bold">{stats.ordersToday}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Prep Time</p>
              <h3 className="text-2xl font-bold">{stats.averagePrepTime}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
              <h3 className="text-2xl font-bold">{orders.filter(o => !['completed', 'rejected'].includes(o.status)).length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board for Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> New Orders</h2>
            <Badge variant="secondary">{orders.filter(o => o.status === 'pending').length}</Badge>
          </div>
          <AnimatePresence>
            {orders.filter(o => o.status === 'pending').map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="border border-red-100 shadow-md">
                  <CardHeader className="p-4 pb-2 bg-red-50/50 dark:bg-red-950/10 rounded-t-xl">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">NEW</span>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                      <Clock className="w-3 h-3" /> {order.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                      <User className="w-4 h-4" /> 
                      <span className="font-medium text-foreground">{order.studentName}</span> ({order.regNumber})
                    </div>
                    <div className="space-y-1 mb-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-2">
                    <Button onClick={() => handleUpdateStatus(order.id, 'rejected')} variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                      Reject
                    </Button>
                    <Button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="flex-1 bg-red-600 hover:bg-red-700">
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Preparing Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Preparing</h2>
            <Badge variant="secondary">{orders.filter(o => o.status === 'preparing').length}</Badge>
          </div>
          <AnimatePresence>
            {orders.filter(o => o.status === 'preparing').map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="border border-orange-100 shadow-sm">
                  <CardHeader className="p-4 pb-2 bg-orange-50/50 dark:bg-orange-950/10 rounded-t-xl">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{order.id}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Delivery: {order.dest}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button onClick={() => handleUpdateStatus(order.id, 'ready')} className="w-full bg-orange-500 hover:bg-orange-600">
                      Mark as Ready
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Ready for Pickup</h2>
            <Badge variant="secondary">{orders.filter(o => o.status === 'ready').length}</Badge>
          </div>
          <AnimatePresence>
            {orders.filter(o => o.status === 'ready').map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="border border-green-100 shadow-sm">
                  <CardHeader className="p-4 pb-2 bg-green-50/50 dark:bg-green-950/10 rounded-t-xl">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{order.id}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium">{order.studentName}</p>
                    <p className="text-xs text-muted-foreground">Waiting for delivery staff...</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button onClick={() => handleUpdateStatus(order.id, 'completed')} variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Handed Over
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
