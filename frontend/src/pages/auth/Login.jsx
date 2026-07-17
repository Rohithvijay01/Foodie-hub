import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      // If this is their first login and they haven't accepted terms yet,
      // the backend will block protected routes with a 403. Auto-accept for now.
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

      // Role-based redirect
      if (enrichedUser.role === 'admin') navigate('/admin');
      else if (enrichedUser.role === 'hotel_manager') navigate('/restaurant');
      else if (enrichedUser.role === 'delivery') navigate('/delivery');
      else navigate('/home');

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#16171d] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Campus Bite</h1>
          <p className="text-muted-foreground">University Canteen Management System</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>Enter your University Registration Number or Employee ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">Registration Number / ID</Label>
                <Input
                  id="id"
                  placeholder="e.g. 22BCE1234"
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

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <a href="/register" className="text-primary font-medium hover:underline">Register</a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
