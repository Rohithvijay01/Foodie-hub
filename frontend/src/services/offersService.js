// TODO: Connect to backend GET /api/v1/offers when available
import api from './api/axios';

const mockOffers = [
  {
    id: 1,
    title: "Student Combo Meal",
    description: "Get a full meal with a beverage at 20% off with your student ID.",
    discount: "20% OFF",
    type: "combo",
    canteen: "Main Canteen",
    validUntil: "2026-12-31T23:59:59Z",
    imageUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&h=400&fit=crop",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    title: "Happy Hour Coffee",
    description: "Buy 1 Get 1 Free on all lattes and cappuccinos from 3 PM to 5 PM.",
    discount: "BOGO",
    type: "beverage",
    canteen: "Library Coffee Shop",
    validUntil: "2026-08-15T17:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
    color: "from-amber-500 to-yellow-600",
  },
  {
    id: 3,
    title: "Hostel Night Owl Special",
    description: "Flat ₹50 off on orders above ₹200 after 10 PM.",
    discount: "₹50 OFF",
    type: "late-night",
    canteen: "Hostel Mess C",
    validUntil: "2026-07-30T23:59:59Z",
    imageUrl: "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=600&h=400&fit=crop",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 4,
    title: "Fresh Start Breakfast",
    description: "Healthy oatmeal and fresh juice combo to start your day right.",
    discount: "15% OFF",
    type: "breakfast",
    canteen: "Juice Corner",
    validUntil: "2026-09-01T10:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    color: "from-emerald-400 to-green-600",
  }
];

export const offersService = {
  getOffers: async () => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockOffers });
      }, 800);
    });
    // Uncomment once backend is ready
    // return api.get('/offers');
  },
  
  getOfferById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockOffers.find(o => o.id === parseInt(id)) });
      }, 500);
    });
    // Uncomment once backend is ready
    // return api.get(`/offers/${id}`);
  }
};
