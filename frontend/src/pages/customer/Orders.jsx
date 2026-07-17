import { Package, Clock, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const MOCK_ORDERS = [
  {
    id: "ORD-94821",
    canteen: "Main Canteen",
    date: "Today, 1:45 PM",
    status: "preparing",
    total: 240,
    items: [
      { name: "Chicken Biryani", quantity: 1, price: 150 },
      { name: "Lime Juice", quantity: 2, price: 90 }
    ]
  },
  {
    id: "ORD-83722",
    canteen: "Library Coffee Shop",
    date: "Yesterday, 4:30 PM",
    status: "delivered",
    total: 120,
    items: [
      { name: "Cold Coffee", quantity: 1, price: 80 },
      { name: "Chocolate Muffin", quantity: 1, price: 40 }
    ]
  },
  {
    id: "ORD-72611",
    canteen: "Hostel Mess C",
    date: "14 Jul 2026, 8:15 PM",
    status: "delivered",
    total: 180,
    items: [
      { name: "Veg Thali", quantity: 2, price: 180 }
    ]
  }
];

export default function Orders() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track your active orders and view your order history.</p>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_ORDERS.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1f2028] rounded-xl border-dashed border-2">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't ordered anything yet.</p>
            <Button asChild>
              <Link to="/canteens">Explore Canteens</Link>
            </Button>
          </div>
        ) : (
          MOCK_ORDERS.map((order) => (
            <Card key={order.id} className="border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <CardTitle className="text-lg">{order.canteen}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {order.date}
                  </p>
                </div>
                <Badge 
                  variant={order.status === 'delivered' ? 'secondary' : 'default'}
                  className={order.status === 'preparing' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}
                >
                  {order.status === 'preparing' ? 'Preparing...' : 'Delivered'}
                  {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3 ml-1" />}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium">x{item.quantity}</span>
                        {item.name}
                      </span>
                      <span className="font-medium">₹{item.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="font-bold">
                    <span className="text-muted-foreground text-sm font-normal mr-2">Total Amount:</span>
                    ₹{order.total}
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
