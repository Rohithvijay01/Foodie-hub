import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Info, Plus, Minus, Search, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/cartStore';
import { consumerService } from '@/services/consumerService';

const MOCK_CATEGORIES = ["Recommended", "Specials", "Main Course", "Snacks", "Beverages"];

const MOCK_MENU = [
  { id: 1, name: "Special Chicken Biryani", desc: "Authentic dum biryani cooked with aromatic spices.", price: 180, isVeg: false, category: "Recommended", calories: 450, prepTime: "20 min", img: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=500&h=400&fit=crop" },
  { id: 2, name: "Paneer Tikka Wrap", desc: "Grilled paneer in a whole wheat tortilla.", price: 90, isVeg: true, category: "Snacks", calories: 320, prepTime: "10 min", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=400&fit=crop" },
  { id: 3, name: "Cold Coffee", desc: "Classic iced coffee.", price: 60, isVeg: true, category: "Beverages", calories: 180, prepTime: "5 min", img: "https://images.unsplash.com/photo-1461023058943-0708e524a721?w=500&h=400&fit=crop" },
  { id: 4, name: "Mini Thali", desc: "Rice, Dal, 2 Roti, Sabzi.", price: 80, isVeg: true, category: "Main Course", calories: 600, prepTime: "15 min", img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&h=400&fit=crop" },
];

export default function CanteenDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [canteen, setCanteen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, addToCart, updateQuantity } = useCartStore();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch hotel details and menu in one call
        const hotelRes = await consumerService.getHotelDetails(id);
        const data = hotelRes.data;

        setCanteen({
          ...data,
          rating: data.rating || 4.5,
          prepTime: "15-20 min",
          isOpen: data.is_open, // Backend returns is_open instead of is_active in this response
          img: data.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&h=400&fit=crop"
        });

        if (data.menu_items && data.menu_items.length > 0) {
          const mappedMenu = data.menu_items.map(item => ({
            id: item.id,
            name: item.name,
            desc: item.description,
            price: item.price,
            isVeg: item.is_vegetarian !== false, // Default to true if missing
            category: "Main Course", // Backend doesn't have categories yet
            calories: 350,
            prepTime: "15 min",
            img: item.image_url || MOCK_MENU[0].img
          }));
          setMenu(mappedMenu);
        } else {
          setMenu(MOCK_MENU);
        }
      } catch (error) {
        console.warn("Falling back to mocks");
        setCanteen({
          name: "Main Canteen",
          address: "Central Campus",
          rating: 4.8,
          prepTime: "15 min",
          isOpen: true,
          img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&h=400&fit=crop"
        });
        setMenu(MOCK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

  const filteredMenu = menu.filter(m => 
    (activeCategory === "Recommended" || m.category === activeCategory) &&
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-[#16171d] min-h-screen pb-24">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full">
        <img src={canteen.img} alt={canteen.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4 max-w-6xl pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={canteen.isOpen ? "default" : "destructive"} className={canteen.isOpen ? "bg-green-500 hover:bg-green-600" : ""}>
                    {canteen.isOpen ? "Open Now" : "Closed"}
                  </Badge>
                  <span className="flex items-center text-sm font-medium"><Clock className="w-4 h-4 mr-1" /> {canteen.prepTime}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{canteen.name}</h1>
                <p className="text-gray-300 flex items-center"><Info className="w-4 h-4 mr-1" /> {canteen.address}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white border border-white/20">
                <div className="text-3xl font-bold flex items-center justify-center text-green-400">
                  {canteen.rating} <Star className="w-6 h-6 ml-1 fill-current" />
                </div>
                <p className="text-xs text-gray-300 text-center mt-1">Campus Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Categories */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-bold text-lg mb-4">Menu</h3>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 no-scrollbar">
              {MOCK_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Menu Items */}
        <main className="flex-1">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#1f2028] border-none shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">{activeCategory}</h2>
            {filteredMenu.map((item, i) => {
              const cartItem = items.find(ci => ci.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-[#1f2028] overflow-hidden">
                    <CardContent className="p-0 flex h-36 md:h-44">
                      <div className="w-3/4 p-4 md:p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                            </div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                          </div>
                          <p className="text-lg font-semibold mb-1">₹{item.price}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-none">{item.desc}</p>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs font-medium text-gray-500 flex items-center"><Flame className="w-3 h-3 mr-1" /> {item.calories} kcal</span>
                          <span className="text-xs font-medium text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> {item.prepTime}</span>
                        </div>
                      </div>
                      
                      <div className="w-1/4 relative">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                          {!cartItem ? (
                            <Button 
                              onClick={() => {
                                addToCart({ id: item.id, name: item.name, price: item.price, img: item.img, hotel_id: canteen.id });
                                toast({ title: "Added to Cart", description: `${item.name} added.` });
                              }}
                              className="bg-white text-primary border border-primary shadow-sm hover:bg-orange-50 font-bold px-6"
                            >
                              ADD
                            </Button>
                          ) : (
                            <div className="flex items-center bg-white border border-primary rounded-md shadow-sm">
                              <button onClick={() => updateQuantity(item.id, "", cartItem.quantity - 1)} className="px-3 py-2 text-primary hover:bg-orange-50 rounded-l-md"><Minus className="w-4 h-4" /></button>
                              <span className="px-2 font-bold text-primary">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, "", cartItem.quantity + 1)} className="px-3 py-2 text-primary hover:bg-orange-50 rounded-r-md"><Plus className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            
            {filteredMenu.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No items found in this category.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
