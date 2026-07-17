import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, ChevronRight, Sparkles, Filter, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { offersService } from '@/services/offersService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await offersService.getOffers();
        setOffers(response.data);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const filteredOffers = activeFilter === 'all' 
    ? offers 
    : offers.filter(offer => offer.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#16171d]/50 pb-16">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-900 dark:to-indigo-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 blur-3xl rounded-full"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/10 shadow-xl">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Exclusive Campus Deals</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
              Eat Better, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">Spend Less.</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100/90 mb-8 max-w-xl font-light">
              Discover amazing discounts, combo meals, and happy hours across all university canteens. Exclusively for students and faculty.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 shadow-lg rounded-full px-8">
                Explore Deals
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
            {['all', 'combo', 'beverage', 'breakfast', 'late-night'].map((filter) => (
              <Button 
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                className={`rounded-full capitalize whitespace-nowrap ${activeFilter === filter ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500' : 'bg-white dark:bg-[#1f2028]'}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 shrink-0">
            <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Apply coupon code..."
              className="pl-9 rounded-full bg-white dark:bg-[#1f2028] border-dashed border-2 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse border-0 shadow-sm h-64 bg-gray-100 dark:bg-[#1f2028]/50 rounded-3xl" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8"
          >
            {filteredOffers.map((offer) => (
              <motion.div key={offer.id} variants={itemVariants}>
                <Card className="overflow-hidden border-0 bg-white dark:bg-[#1f2028] shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl group flex flex-col sm:flex-row h-full">
                  <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${offer.color} opacity-40 mix-blend-multiply z-10`}></div>
                    <img src={offer.imageUrl} alt={offer.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-white/90 text-black backdrop-blur-md font-bold px-3 py-1 shadow-lg text-sm border-0">
                        {offer.discount}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{offer.canteen}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 leading-tight dark:text-gray-100">{offer.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        Valid till {new Date(offer.validUntil).toLocaleDateString()}
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {!loading && filteredOffers.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No offers found</h3>
            <p className="text-muted-foreground">There are no active offers in this category right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
