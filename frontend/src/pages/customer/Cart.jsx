import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, MapPin, Building, GraduationCap, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { consumerService } from '@/services/consumerService';

const DELIVERY_OPTIONS = [
  { id: 'hostel', icon: Building, label: 'Hostel Room', desc: 'Deliver directly to your hostel block & room' },
  { id: 'classroom', icon: GraduationCap, label: 'Classroom', desc: 'Deliver to your academic block & classroom' },
  { id: 'pickup', icon: MapPin, label: 'Pickup', desc: 'Pick up yourself from the canteen counter' }
];

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [deliveryType, setDeliveryType] = useState('hostel');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = deliveryType === 'pickup' ? 0 : 20;
  const platformFee = 5;
  const total = subtotal + deliveryFee + platformFee;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      if (items.length === 0) return;
      
      const hotelId = items[0].hotel_id; // Assume all items in cart belong to the same canteen for now
      const orderItems = items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      await consumerService.placeOrder({
        hotel_id: hotelId,
        items: orderItems,
        text_order: null
      });

      setIsSuccess(true);
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: "Your food is being prepared.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.response?.data?.message || "Could not place order.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your order has been placed and sent to the canteen.</p>
          <Button onClick={() => navigate('/orders')} className="bg-primary text-white">Track Order</Button>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-48 h-48 bg-gray-100 dark:bg-[#1f2028] rounded-full flex items-center justify-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/1046/1046766.png" alt="Empty Cart" className="w-24 h-24 opacity-50 filter grayscale" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/canteens')} className="bg-primary text-white px-8">Browse Canteens</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items & Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
            <CardHeader className="border-b pb-4">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-4 py-2"
                  >
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-primary font-bold">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, "", item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, "", item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-md text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ml-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028]">
            <CardHeader className="border-b pb-4">
              <CardTitle>Delivery Destination</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {DELIVERY_OPTIONS.map(option => (
                  <div 
                    key={option.id}
                    onClick={() => setDeliveryType(option.id)}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                      deliveryType === option.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-primary/30'
                    }`}
                  >
                    <option.icon className={`w-6 h-6 mb-2 ${deliveryType === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h4 className="font-semibold mb-1">{option.label}</h4>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Delivery Form based on selection */}
              {deliveryType === 'hostel' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hostel Block</Label>
                    <Input defaultValue={user?.hostel || ""} placeholder="e.g. Block C" />
                  </div>
                  <div className="space-y-2">
                    <Label>Room Number</Label>
                    <Input defaultValue={user?.room || ""} placeholder="e.g. 312" />
                  </div>
                </motion.div>
              )}

              {deliveryType === 'classroom' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Block</Label>
                    <Input defaultValue={user?.department || ""} placeholder="e.g. CS Block" />
                  </div>
                  <div className="space-y-2">
                    <Label>Class / Lab Number</Label>
                    <Input placeholder="e.g. Lab 4" />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
          
        </div>

        {/* Right Column: Payment & Bill */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white dark:bg-[#1f2028] sticky top-24">
            <CardHeader className="border-b pb-4">
              <CardTitle>Payment details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Payment Methods */}
              <div className="space-y-3">
                <div 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50 dark:bg-gray-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-primary">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Campus Wallet</p>
                      <p className="text-xs text-muted-foreground">Balance: ₹1,240</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50 dark:bg-gray-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">UPI / Card</p>
                      <p className="text-xs text-muted-foreground">Pay via external gateways</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-muted-foreground">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-500">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>To Pay</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay ₹${total}`}
              </Button>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
