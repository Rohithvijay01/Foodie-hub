import React from 'react';
import { Utensils, Zap, ShieldCheck, MapPin, ChevronRight, Search, Server } from 'lucide-react';
import { useHealth } from './hooks/useApi';
import './App.css';

function App() {
  const { data: health, isLoading, isError } = useHealth();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer group">
          <Utensils className="text-primary w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
          <div className="text-2xl font-heading font-bold text-primary tracking-tight">
            FoodieHub
          </div>
          <div className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-xs font-bold text-slate-500">
            <Server className="w-3.5 h-3.5" />
            {isLoading ? 'Connecting...' : isError ? <span className="text-destructive">Offline</span> : <span className="text-emerald-500">Online</span>}
          </div>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-bold">
          <a href="#" className="hover:text-primary transition-colors duration-200">Delivery</a>
          <a href="#" className="hover:text-primary transition-colors duration-200">Dining Out</a>
          <a href="#" className="hover:text-primary transition-colors duration-200">Offers</a>
        </div>
        <div className="flex space-x-4 items-center">
          <button className="hidden sm:block px-5 py-2.5 text-sm font-bold rounded-full hover:bg-muted transition-colors duration-300">
            Log in
          </button>
          <button className="px-6 py-2.5 text-sm font-bold rounded-full bg-primary text-on-primary hover:bg-secondary hover:-translate-y-0.5 transition-transform duration-300 shadow-lg">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden px-6 md:px-12 max-w-7xl mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col items-start text-left z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-bold tracking-wide">
              <MapPin className="w-4 h-4" />
              Now delivering to your neighborhood
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6">
              Taste the <br />
              <span className="text-primary relative inline-block">
                extraordinary
                <svg className="absolute w-full h-4 -bottom-1 left-0 text-accent/30 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
                </svg>
              </span>.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              Discover local hidden gems, order your favorite meals, and experience lightning-fast delivery to your door.
            </p>
            
            <div className="w-full flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="What are you craving?" 
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-lg font-medium bg-white"
                />
              </div>
              <button className="px-8 py-4 text-lg font-bold rounded-full bg-primary text-on-primary hover:bg-secondary hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shrink-0 group">
                Find Food
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
              <span>Popular:</span>
              <a href="#" className="px-4 py-2 bg-white border border-border hover:border-primary hover:text-primary rounded-full transition-colors">Sushi</a>
              <a href="#" className="px-4 py-2 bg-white border border-border hover:border-primary hover:text-primary rounded-full transition-colors">Pizza</a>
              <a href="#" className="px-4 py-2 bg-white border border-border hover:border-primary hover:text-primary rounded-full transition-colors">Burgers</a>
            </div>
          </div>
          
          {/* Hero Image/Abstract Art - Vibrant Block Based */}
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[3rem] bg-muted overflow-hidden flex items-center justify-center border-8 border-white shadow-2xl z-10 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-400 opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-primary rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
              <Utensils className="w-32 h-32 text-on-primary" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full flex items-center justify-center border-8 border-white shadow-xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                 <div className="text-center text-white">
                   <div className="font-heading font-bold text-3xl">4.9</div>
                   <div className="text-xs font-bold tracking-wider">STARS</div>
                 </div>
              </div>
            </div>
            
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary rounded-3xl rotate-12 mix-blend-multiply opacity-50 blur-sm"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent rounded-full mix-blend-multiply opacity-40 blur-md"></div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-40">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">Why FoodieHub?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: 'Lightning Fast', desc: 'Real-time tracking and delivery in under 30 minutes. Hot and fresh.', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
              { title: 'Top Rated', desc: 'Curated list of the finest restaurants and hidden gems in your area.', icon: Utensils, color: 'text-accent', bg: 'bg-accent/10' },
              { title: 'Secure & Easy', desc: 'Seamless payments and a delightful one-tap ordering experience.', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-white border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="mt-40 rounded-[3rem] bg-primary text-on-primary p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-secondary opacity-0 hover:opacity-100 transition-opacity duration-700 -z-10"></div>
           <div className="relative z-10">
             <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">Ready to order?</h2>
             <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto font-medium">
               Join thousands of foodies who have already discovered their new favorite dishes.
             </p>
             <button className="px-10 py-5 text-xl font-bold rounded-full bg-white text-primary hover:bg-background hover:scale-105 transition-transform duration-300 shadow-xl">
               Get the App
             </button>
           </div>
           {/* Decorative elements */}
           <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
           <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-foreground text-white py-16 px-6 md:px-12">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center gap-2 mb-6">
                 <Utensils className="text-primary w-8 h-8" />
                 <div className="text-2xl font-heading font-bold text-white tracking-tight">
                   FoodieHub
                 </div>
               </div>
               <p className="text-slate-400 text-base font-medium leading-relaxed mb-6">
                 Delivering happiness, one meal at a time. Your favorite restaurants, instantly accessible.
               </p>
            </div>
            <div>
               <h4 className="text-lg font-bold mb-6 font-heading tracking-wide">Company</h4>
               <ul className="space-y-4 text-base text-slate-400 font-medium">
                 <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-lg font-bold mb-6 font-heading tracking-wide">Support</h4>
               <ul className="space-y-4 text-base text-slate-400 font-medium">
                 <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-lg font-bold mb-6 font-heading tracking-wide">Legal</h4>
               <ul className="space-y-4 text-base text-slate-400 font-medium">
                 <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm font-medium text-slate-500">
            © 2026 FoodieHub. All rights reserved.
         </div>
      </footer>
    </div>
  );
}

export default App;
