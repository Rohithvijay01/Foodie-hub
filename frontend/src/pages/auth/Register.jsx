import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const registerSchema = z.object({
  id: z.string().regex(/^21222[2-6](?:0[1-9]|1[0-9]|2[0-5])(?:000[1-9]|00[1-9][0-9]|01[0-9]{2}|0200)$/, "Must be a valid register number (e.g. 212222010001)"),
  fullName: z.string().min(2, "Full Name is required").max(100).regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces allowed"),
  email: z.string().email("Invalid university email address"),
  mobileNumber: z.string().regex(/^\+91[0-9]{10}$/, "Must be in +91xxxxxxxxxx format"),
  department: z.string().min(2),
  course: z.string().optional(), // Documented for future backend support
  academicYear: z.string().optional(), // Documented for future backend support
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Send to FastAPI backend
      // Note: course and academicYear are currently unsupported by backend schemas.
      // They are ignored in the payload until Phase 2 database enhancements are made.
      await authService.register({
        username: data.id,
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: 'consumer',
        mobile_number: data.mobileNumber,
        department: data.department,
        register_number: data.id
      });

      toast({
        title: "Registration Successful!",
        description: "Your university account has been created. Please log in.",
      });

      navigate('/login');

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#16171d] p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Campus Bite</h1>
          <p className="text-muted-foreground">Join the University Canteen Network</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
            <CardDescription>Enter your University details to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="id">Registration Number</Label>
                <Input
                  id="id"
                  placeholder="e.g. 212222010001"
                  {...register('id')}
                  className={errors.id ? "border-destructive" : ""}
                />
                {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Rohith V"
                  {...register('fullName')}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    {...register('department')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.department ? "border-destructive" : ""}`}
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                  {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+919876543210"
                    {...register('mobileNumber')}
                    className={errors.mobileNumber ? "border-destructive" : ""}
                  />
                  {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber.message}</p>}
                </div>
              </div>

              {/* These fields are present in UI but ignored in backend API submission for now */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                  <select
                    id="course"
                    {...register('course')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="Ph.D">Ph.D</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                  <select
                    id="academicYear"
                    {...register('academicYear')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">University Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. rohith.v@university.edu"
                  {...register('email')}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-2" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="text-primary font-medium hover:underline">Sign In</a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
