import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Store, Bike, ShieldCheck, ArrowLeft } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters").max(20, "ID is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const roleConfig = {
  student: {
    title: "Student Login",
    description: "Access your campus dining account.",
    icon: GraduationCap,
    backendRole: "consumer",
    redirectPath: "/home",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20"
  },
  canteen: {
    title: "Canteen Manager Login",
    description: "Manage your university canteen dashboard.",
    icon: Store,
    backendRole: "hotel_manager",
    redirectPath: "/restaurant",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20"
  },
  delivery: {
    title: "Delivery Staff Login",
    description: "Access your active campus deliveries.",
    icon: Bike,
    backendRole: "delivery",
    redirectPath: "/delivery",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/20"
  },
  admin: {
    title: "Administrator Login",
    description: "Access the university management portal.",
    icon: ShieldCheck,
    backendRole: "admin",
    redirectPath: "/admin",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20"
  }
};

export default function RoleLogin({ roleType }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const config = roleConfig[roleType];
  const Icon = config.icon;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Send standard JSON payload to the FastAPI backend
      const response = await authService.login({
        username: data.id,
        password: data.password
      });

      const { access_token, user } = response.data;
      
      // Strict Role Checking: Prevent a student from logging into the Admin portal, etc.
      if (user.role !== config.backendRole) {
         toast({
            variant: "destructive",
            title: "Access Denied",
            description: `You are registered as a ${user.role}, but tried to login to the ${roleType} portal.`,
         });
         setIsLoading(false);
         return;
      }

      // Ensure university fields are populated (fallback for mocked frontend deep profile)
      const enrichedUser = {
        ...user,
        registrationNumber: user.username,
        department: user.department || 'Computer Science & Engineering',
        year: user.year || 'III Year',
        section: user.section || 'A',
        hostel: user.hostel || 'Hostel Block C',
        room: user.room || '312',
      };

      login(access_token, enrichedUser);
      
      if (response.data.first_login_terms_required) {
        try {
          await authService.acceptTerms();
          enrichedUser.terms_accepted = true;
          useAuthStore.getState().updateUser({ terms_accepted: true });
        } catch (termError) {
          console.warn("Failed to automatically accept terms", termError);
        }
      }
      
      toast({
        title: "Welcome Back!",
        description: `Logged in successfully as ${enrichedUser.username}`,
      });

      // Navigate to their specific dashboard
      navigate(config.redirectPath);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#16171d] p-4 relative">
      <Button variant="ghost" asChild className="absolute top-8 left-8 hidden sm:flex">
         <Link to="/" className="text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Portals</Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${config.bg}`}>
             <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>Enter your official university credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">{roleType === 'student' ? 'Registration Number' : 'Employee ID'}</Label>
                <Input
                  id="id"
                  placeholder={roleType === 'student' ? 'e.g. 22BCE1234' : 'e.g. EMP-1234'}
                  {...register('id')}
                  className={errors.id ? "border-destructive" : ""}
                />
                {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-11" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Secure Login"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link to={`/${roleType}/register`} className={`${config.color} font-medium hover:underline`}>Register here</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
