import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Store, Bike, ShieldCheck, ArrowLeft } from 'lucide-react';

import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Role configurations and specific validation schemas
const roleConfig = {
  student: {
    title: "Student Registration",
    description: "Create your campus dining account.",
    icon: GraduationCap,
    backendRole: "consumer",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    schema: z.object({
      id: z.string().regex(/^2[0-9]{2,15}$/, "Must be a valid register number (e.g. 212222010001)"),
      fullName: z.string().min(2, "Full Name is required").max(100),
      email: z.string().email("Invalid university email address"),
      mobileNumber: z.string().regex(/^\+?[0-9]{10,12}$/, "Valid mobile number required"),
      department: z.string().min(2, "Department is required"),
      course: z.string().optional(),
      academicYear: z.string().optional(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
  },
  canteen: {
    title: "Canteen Manager Registration",
    description: "Create your canteen management account.",
    icon: Store,
    backendRole: "hotel_manager",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    schema: z.object({
      id: z.string().min(3, "Employee ID is required"),
      fullName: z.string().min(2, "Full Name is required").max(100),
      email: z.string().email("Invalid email address"),
      mobileNumber: z.string().regex(/^\+?[0-9]{10,12}$/, "Valid mobile number required"),
      canteenName: z.string().min(2, "Canteen Name is required"),
      location: z.string().min(2, "Location is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
  },
  delivery: {
    title: "Delivery Staff Registration",
    description: "Join the campus delivery network.",
    icon: Bike,
    backendRole: "delivery",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/20",
    schema: z.object({
      id: z.string().min(3, "Employee ID is required"),
      fullName: z.string().min(2, "Full Name is required").max(100),
      email: z.string().email("Invalid email address"),
      mobileNumber: z.string().regex(/^\+?[0-9]{10,12}$/, "Valid mobile number required"),
      vehicleType: z.string().min(2, "Vehicle Type is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
  },
  admin: {
    title: "Administrator Registration",
    description: "Create an admin portal account.",
    icon: ShieldCheck,
    backendRole: "admin",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    schema: z.object({
      id: z.string().min(3, "Admin ID is required"),
      fullName: z.string().min(2, "Full Name is required").max(100),
      email: z.string().email("Invalid email address"),
      mobileNumber: z.string().regex(/^\+?[0-9]{10,12}$/, "Valid mobile number required"),
      adminCode: z.string().min(5, "Authorization code is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
  }
};

export default function RoleRegister({ roleType }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const config = roleConfig[roleType];
  const Icon = config.icon;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(config.schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Build the standard payload for the backend.
      // Note: The backend currently ignores extra fields (like canteenName or adminCode),
      // they are captured here in preparation for future database migrations.
      const payload = {
        username: data.id,
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: config.backendRole,
        mobile_number: data.mobileNumber,
        department: data.department || "N/A", // Required by backend for consumer
        register_number: data.id
      };

      await authService.register(payload);

      toast({
        title: "Registration Successful!",
        description: `Your ${roleType} account has been created. Please log in.`,
      });

      navigate(`/${roleType}/login`);

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

  const renderRoleSpecificFields = () => {
    switch(roleType) {
      case 'student':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  {...register('department')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.department ? "border-destructive" : ""}`}
                >
                  <option value="">Select Dept...</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                </select>
                {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  {...register('course')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Ph.D">Ph.D</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <select
                id="academicYear"
                {...register('academicYear')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </>
        );
      case 'canteen':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="canteenName">Canteen Name *</Label>
              <Input id="canteenName" placeholder="e.g. North Block Cafe" {...register('canteenName')} className={errors.canteenName ? "border-destructive" : ""} />
              {errors.canteenName && <p className="text-xs text-destructive">{errors.canteenName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Campus Zone *</Label>
              <Input id="location" placeholder="e.g. Academic Block" {...register('location')} className={errors.location ? "border-destructive" : ""} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
          </>
        );
      case 'delivery':
        return (
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Input id="vehicleType" placeholder="e.g. Bicycle, Electric Scooter" {...register('vehicleType')} className={errors.vehicleType ? "border-destructive" : ""} />
            {errors.vehicleType && <p className="text-xs text-destructive">{errors.vehicleType.message}</p>}
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-2">
            <Label htmlFor="adminCode">Admin Authorization Code *</Label>
            <Input id="adminCode" type="password" placeholder="Enter secure code provided by IT" {...register('adminCode')} className={errors.adminCode ? "border-destructive" : ""} />
            {errors.adminCode && <p className="text-xs text-destructive">{errors.adminCode.message}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#16171d] p-4 py-12 relative">
      <Button variant="ghost" asChild className="absolute top-8 left-8 hidden sm:flex">
         <Link to={`/${roleType}/login`} className="text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Login</Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
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
            <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
            <CardDescription>Enter your official details to register.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">{roleType === 'student' ? 'Registration No.' : 'Employee ID'} *</Label>
                  <Input
                    id="id"
                    placeholder={roleType === 'student' ? '22BCE1234' : 'EMP-1234'}
                    {...register('id')}
                    className={errors.id ? "border-destructive" : ""}
                  />
                  {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@university.edu"
                    {...register('email')}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile *</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+919876543210"
                    {...register('mobileNumber')}
                    className={errors.mobileNumber ? "border-destructive" : ""}
                  />
                  {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber.message}</p>}
                </div>
              </div>

              {/* Dynamic Role Specific Fields Rendered Here */}
              {renderRoleSpecificFields()}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
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
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" className={`w-full hover:opacity-90 text-white mt-4 rounded-full h-11 ${roleType === 'student' ? 'bg-blue-600' : roleType === 'canteen' ? 'bg-orange-600' : roleType === 'delivery' ? 'bg-green-600' : 'bg-purple-600'}`} disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to={`/${roleType}/login`} className={`${config.color} font-medium hover:underline`}>Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
