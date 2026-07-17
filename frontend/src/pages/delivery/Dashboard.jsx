import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, CheckCircle2, Clock, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const MOCK_DELIVERIES = [
  { id: "DEL-8472", canteen: "North Block Cafe", dropoff: "CS Block, Lab 4", items: 2, amount: "₹180", status: "available", time: "2 mins ago" },
  { id: "DEL-8473", canteen: "Main Canteen", dropoff: "Hostel Block C, Room 312", items: 4, amount: "₹350", status: "accepted", time: "10 mins ago" },
  { id: "DEL-8470", canteen: "Juice Corner", dropoff: "Sports Complex", items: 1, amount: "₹60", status: "completed", time: "1 hour ago" },
];

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);
  const { toast } = useToast();

  const handleStatusChange = (id, newStatus) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: newStatus } : d));
    if (newStatus === 'accepted') {
      toast({ title: "Delivery Accepted", description: "Navigate to the canteen for pickup." });
    } else if (newStatus === 'completed') {
      toast({ title: "Delivery Completed", description: "Great job! Earnings updated." });
    }
  };

  const renderDeliveryCard = (delivery) => (
    <motion.div 
      key={delivery.id} 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, height: 0 }}
    >
      <Card className="mb-4 overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-[#1f2028]">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> {delivery.id}
            </CardTitle>
            <span className="text-xs font-medium text-muted-foreground">{delivery.time}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-[#1f2028]" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pickup</p>
              <p className="font-medium">{delivery.canteen}</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#1f2028]" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dropoff</p>
              <p className="font-medium">{delivery.dropoff}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-800">
            <span className="text-sm font-medium">{delivery.items} Items</span>
            <span className="font-bold text-lg">{delivery.amount}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 gap-2 bg-white dark:bg-[#1f2028]">
          {delivery.status === 'available' && (
            <Button onClick={() => handleStatusChange(delivery.id, 'accepted')} className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
              Accept Delivery
            </Button>
          )}
          {delivery.status === 'accepted' && (
            <>
              <Button variant="outline" className="flex-1 rounded-full">
                <Navigation className="w-4 h-4 mr-2" /> Maps
              </Button>
              <Button onClick={() => handleStatusChange(delivery.id, 'completed')} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Delivered
              </Button>
            </>
          )}
          {delivery.status === 'completed' && (
            <Badge variant="secondary" className="w-full py-2 justify-center bg-gray-100 text-gray-500">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Successfully Delivered
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Campus Delivery Portal</h1>
        <p className="text-muted-foreground mt-1">Accept and manage active campus deliveries.</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full">
          <TabsTrigger value="available" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Available ({deliveries.filter(d => d.status === 'available').length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active ({deliveries.filter(d => d.status === 'accepted').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 outline-none">
          <AnimatePresence>
            {deliveries.filter(d => d.status === 'available').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No deliveries available right now.</div>
            ) : (
              deliveries.filter(d => d.status === 'available').map(renderDeliveryCard)
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 outline-none">
          <AnimatePresence>
            {deliveries.filter(d => d.status === 'accepted').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">You don't have any active deliveries.</div>
            ) : (
              deliveries.filter(d => d.status === 'accepted').map(renderDeliveryCard)
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 outline-none">
          <AnimatePresence>
            {deliveries.filter(d => d.status === 'completed').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No completed deliveries today.</div>
            ) : (
              deliveries.filter(d => d.status === 'completed').map(renderDeliveryCard)
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
