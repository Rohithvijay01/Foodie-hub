import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock, MapPin, Coffee, Utensils, Star, Activity, Flame } from 'lucide-react';

const CANTEENS = [
  { id: 1, name: "Main Canteen", rating: 4.8, type: "Multi-Cuisine", time: "10-15 min", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop" },
  { id: 2, name: "North Block Cafe", rating: 4.5, type: "Beverages & Snacks", time: "5-10 min", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=300&fit=crop" },
  { id: 3, name: "Engineering Mess", rating: 4.2, type: "Meals & Thalis", time: "15-20 min", img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&h=300&fit=crop" },
];

export default function Home() {
  return (
    <div className="w-full flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-24 md:pt-32 md:pb-40 px-4 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container relative z-10 mx-auto max-w-6xl flex flex-col items-center text-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
          >
            <Activity className="w-4 h-4" />
            <span>Peak Hour: Engineering Mess queue is 15 mins</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground"
          >
            Campus Bite <span className="text-primary">Dining</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-4"
          >
            Skip the queues. Order food directly to your Hostel Block, Department, or Classroom. Experience premium university dining.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white rounded-full">
              Order Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
              View Daily Mess Menu
            </Button>
          </motion.div>
        </div>
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Campus Destinations / Categories */}
      <section className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> Delivery Destinations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Hostel Blocks', 'Classrooms', 'Departments', 'Campus Pickup Points'].map((dest, i) => (
            <motion.div
              key={dest}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {i === 0 ? <Utensils /> : i === 1 ? <Clock /> : i === 2 ? <Coffee /> : <MapPin />}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{dest}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Campus Canteens */}
      <section className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Campus Canteens</h2>
          <Button variant="link" className="text-primary">View All <ArrowRight className="ml-1 w-4 h-4" /></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CANTEENS.map((canteen, i) => (
            <motion.div
              key={canteen.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-0 bg-white dark:bg-[#1f2028]">
                <div className="relative h-48 w-full">
                  <img src={canteen.img} alt={canteen.name} className="object-cover w-full h-full" />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3 text-primary" /> {canteen.time}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{canteen.name}</h3>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-sm font-bold">
                      {canteen.rating} <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{canteen.type}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Daily Mess Menu & Specials */}
      <section className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" /> Today's Mess Menu & Specials
          </h2>
          <Button variant="link" className="text-primary">See All <ArrowRight className="ml-1 w-4 h-4" /></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mess Menu Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="h-full border-0 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-[#1f2028] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">Engineering Mess</h3>
                    <p className="text-sm text-muted-foreground">Lunch (12:30 PM - 2:30 PM)</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded">Live Now</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500" /> Paneer Butter Masala</li>
                  <li className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500" /> Dal Tadka & Jeera Rice</li>
                  <li className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500" /> Butter Roti & Salad</li>
                  <li className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-green-500" /> Gulab Jamun</li>
                </ul>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Pre-Book Lunch (₹80)</Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Special Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="h-full overflow-hidden border-0 bg-white dark:bg-[#1f2028] hover:shadow-lg transition-shadow relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <CardContent className="p-0 flex h-full">
                <div className="w-2/5">
                  <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop" alt="Burger" className="h-full w-full object-cover" />
                </div>
                <div className="w-3/5 p-6 flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">North Block Cafe</span>
                  <h3 className="text-xl font-bold mb-2">Double Chicken Burger Combo</h3>
                  <p className="text-sm text-muted-foreground mb-4">Includes peri-peri fries and a cold beverage.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₹199 <span className="text-xs text-muted-foreground line-through">₹250</span></span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
