import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star, Coffee, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { consumerService } from '@/services/consumerService';
import { useSearchStore } from '@/store/searchStore';

// Mock Data as fallback while backend API is being implemented
const MOCK_CANTEENS = [
  { id: 1, name: "Main Canteen", location: "Central Campus", rating: 4.8, type: "Multi-Cuisine", time: "10-15 min", isOpen: true, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop" },
  { id: 2, name: "North Block Cafe", location: "Engineering Block", rating: 4.5, type: "Beverages & Snacks", time: "5-10 min", isOpen: true, img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=300&fit=crop" },
  { id: 3, name: "Hostel Mess C", location: "Hostel Zone", rating: 4.2, type: "Meals & Thalis", time: "15-20 min", isOpen: true, img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&h=300&fit=crop" },
  { id: 4, name: "Juice Corner", location: "Sports Complex", rating: 4.6, type: "Fresh Juices", time: "5 min", isOpen: false, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=300&fit=crop" },
  { id: 5, name: "Library Coffee Shop", location: "Central Library", rating: 4.9, type: "Coffee & Pastries", time: "5-10 min", isOpen: true, img: "https://images.unsplash.com/photo-1495474472201-3ce362425259?w=500&h=300&fit=crop" },
];

export default function Canteens() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useSearchStore();

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        // Try real API first
        const response = await consumerService.getHotels();
        // The API returns an object { hotels: [...], total: X }
        const hotelsData = response.data.hotels || [];
        
        if (hotelsData.length === 0) {
          // If the database is empty, show the mock data for preview purposes
          console.log("Database is empty, showing mock canteens");
          setCanteens(MOCK_CANTEENS);
        } else {
          const mapped = hotelsData.map(h => ({
            id: h.id,
            name: h.name,
            location: h.address || "Campus Location",
            rating: h.rating || 4.0,
            type: h.description || "Various",
            time: "15 min", // Mocked field, update when backend supports preparation time estimation
            isOpen: h.is_active,
            img: h.image_url || MOCK_CANTEENS[0].img
          }));
          setCanteens(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch canteens:", error);
        // Do not fall back to mock data on authentication failures
      } finally {
        setLoading(false);
      }
    };
    fetchCanteens();
  }, []);

  const filteredCanteens = canteens.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campus Canteens</h1>
          <p className="text-muted-foreground mt-1">Discover food options across the university</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search canteens or locations..."
              className="pl-9 rounded-full bg-white dark:bg-[#1f2028]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canteens Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse border-0 shadow-sm h-72 bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCanteens.map((canteen, i) => (
            <motion.div
              key={canteen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/canteens/${canteen.id}`}>
                <Card className={`overflow-hidden h-full border-0 bg-white dark:bg-[#1f2028] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ${!canteen.isOpen && 'opacity-70 grayscale-[30%]'}`}>
                  <div className="relative h-48 w-full">
                    <img src={canteen.img} alt={canteen.name} className="object-cover w-full h-full" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-primary" /> {canteen.time}
                    </div>
                    {!canteen.isOpen && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm px-3 py-1">Closed Currently</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold line-clamp-1">{canteen.name}</h3>
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-sm font-bold shrink-0">
                        {canteen.rating} <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {canteen.location}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 hover:bg-orange-100 font-normal">
                        <Coffee className="w-3 h-3 mr-1" /> {canteen.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {filteredCanteens.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No canteens found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
