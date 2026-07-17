import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const registerSchema = z.object({
  canteenName: z.string().min(3, "Canteen name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(2, "Location is required"),
  foodType: z.string().min(2, "Food type is required"),
  description: z.string().min(10, "Please provide a brief description"),
  operatingHours: z.string().min(3, "Operating hours are required"),
});

export default function RegisterCanteen() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement backend integration
      // await consumerService.registerCanteen(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-lg text-center p-6 bg-white dark:bg-[#1f2028]">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">Request Submitted!</CardTitle>
            <CardDescription className="text-base mb-6">
              Your request has been submitted successfully. The University Administrator will review your application and contact you shortly.
            </CardDescription>
            <Button asChild className="w-full rounded-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" asChild className="mb-6 -ml-4">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Register Your Canteen</h1>
            <p className="text-muted-foreground text-lg">Partner with Campus Bite to digitize your university food business.</p>
          </div>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Canteen Details</CardTitle>
              <CardDescription>Please provide accurate information for the university administration to review.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="canteenName">Canteen Name *</Label>
                    <Input id="canteenName" placeholder="e.g. North Block Cafe" {...register('canteenName')} />
                    {errors.canteenName && <p className="text-xs text-destructive">{errors.canteenName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Full Name *</Label>
                    <Input id="ownerName" placeholder="John Doe" {...register('ownerName')} />
                    {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" placeholder="contact@example.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="+91 9876543210" {...register('phone')} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Campus Location *</Label>
                  <Select onValueChange={(v) => setValue('location', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a zone..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Block</SelectItem>
                      <SelectItem value="hostel_boys">Boys Hostel Zone</SelectItem>
                      <SelectItem value="hostel_girls">Girls Hostel Zone</SelectItem>
                      <SelectItem value="sports">Sports Complex</SelectItem>
                      <SelectItem value="library">Central Library</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="foodType">Primary Food Type *</Label>
                    <Input id="foodType" placeholder="e.g. Multi-Cuisine, Beverages, Snacks" {...register('foodType')} />
                    {errors.foodType && <p className="text-xs text-destructive">{errors.foodType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours *</Label>
                    <Input id="operatingHours" placeholder="e.g. 8:00 AM - 10:00 PM" {...register('operatingHours')} />
                    {errors.operatingHours && <p className="text-xs text-destructive">{errors.operatingHours.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe your canteen and the menu you plan to offer..."
                    className="min-h-[100px]"
                    {...register('description')} 
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button type="submit" className="w-full h-12 text-base rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Application..." : "Submit Registration Request"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By submitting this request, you agree to the University Food Safety & Service Guidelines.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
