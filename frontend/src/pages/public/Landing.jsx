import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, Store, Bike, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const portals = [
  {
    title: "Student Portal",
    description: "Order food from campus canteens, track orders, manage your profile.",
    icon: GraduationCap,
    href: "/student/login",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white"
  },
  {
    title: "Canteen Manager",
    description: "Manage menus, receive orders, prepare food, monitor revenue.",
    icon: Store,
    href: "/canteen/login",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    buttonColor: "bg-orange-600 hover:bg-orange-700 text-white"
  },
  {
    title: "Campus Delivery",
    description: "Accept deliveries, manage active orders, complete deliveries.",
    icon: Bike,
    href: "/delivery/login",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
    buttonColor: "bg-green-600 hover:bg-green-700 text-white"
  },
  {
    title: "University Admin",
    description: "Manage users, canteens, reports and analytics.",
    icon: ShieldCheck,
    href: "/admin/login",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    buttonColor: "bg-purple-600 hover:bg-purple-700 text-white"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Campus Bite
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="hidden sm:flex rounded-full">
              <Link to="/register-canteen">Register Your Canteen</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>The Next Generation Campus Dining Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
              University Canteen <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A unified platform connecting students, canteens, and delivery staff for a seamless campus dining experience.
            </p>
          </motion.div>

          {/* Portal Grid */}
          <div className="container mx-auto max-w-6xl mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {portals.map((portal, index) => {
                const Icon = portal.icon;
                return (
                  <motion.div
                    key={portal.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={portal.href} className="block h-full outline-none">
                      <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-[#1f2028] flex flex-col group cursor-pointer">
                        <CardHeader>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${portal.bg}`}>
                            <Icon className={`w-6 h-6 ${portal.color}`} />
                          </div>
                          <CardTitle className="text-xl">{portal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <CardDescription className="text-base">
                            {portal.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter>
                          <div className={`w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-colors flex justify-center items-center ${portal.buttonColor}`}>
                            Login to Portal <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Canteen Registration CTA */}
        <section className="py-24 px-4 bg-white dark:bg-[#1f2028] border-t dark:border-gray-800">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Are you a food vendor on campus?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join the Campus Bite network to streamline your orders, manage your digital menu, and reach thousands of students every day.
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/register-canteen">Request Canteen Access</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-gray-50 dark:bg-[#16171d]">
        <p>© 2026 Campus Bite - University Canteen Management System</p>
      </footer>
    </div>
  );
}
