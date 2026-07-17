import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Building, MapPin, BookOpen, Clock, BadgeCheck } from 'lucide-react';

import { consumerService } from '@/services/consumerService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await consumerService.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load profile",
        description: "Could not fetch your university profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading Profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Error loading profile data.</p>
        <Button onClick={fetchProfile} variant="outline">Retry</Button>
      </div>
    );
  }

  // Graceful degradation for fields missing from the backend 'FullUserRead' schema
  const displayField = (value, fallback = "Not Available") => value || fallback;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">University Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar / Identity */}
        <Card className="col-span-1 shadow-sm border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-[#1f2028]">
                <AvatarImage src={profile.profile_picture_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.register_number || profile.full_name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="Profile Logo" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {profile.full_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-1">
              <BadgeCheck className="w-4 h-4 text-green-500" />
              Verified Student
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase">Registration Number</span>
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-primary" />
                {profile.register_number}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase">Mobile</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {profile.mobile_number}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase">Email</span>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                {profile.email}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Details */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="shadow-sm border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Department</span>
                <p className="font-medium mt-1">{displayField(profile.department)}</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Year</span>
                <p className="font-medium mt-1 text-muted-foreground italic">
                  {/* Phase 2 TODO: Replace with profile.year when added to backend */}
                  Not Available
                </p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Semester</span>
                <p className="font-medium mt-1 text-muted-foreground italic">
                  {/* Phase 2 TODO: Replace with profile.semester when added to backend */}
                  Not Available
                </p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Section</span>
                <p className="font-medium mt-1 text-muted-foreground italic">
                  {/* Phase 2 TODO: Replace with profile.section when added to backend */}
                  Not Available
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white/70 dark:bg-[#1f2028]/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Hostel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Hostel Block</span>
                <p className="font-medium mt-1 flex items-center gap-2 text-muted-foreground italic">
                  <MapPin className="w-4 h-4" />
                  Not Available
                </p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Room Number</span>
                <p className="font-medium mt-1 text-muted-foreground italic">
                  Not Available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
