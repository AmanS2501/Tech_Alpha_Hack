'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Building, Shield, Key } from 'lucide-react';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data - in a real app, this would come from your authentication system
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Pharmacy',
    role: 'Pharmacist',
    avatar: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Here you would implement actual profile update logic
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
    }, 1000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Here you would implement actual password update logic
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
    }, 1000);
  };

  return (
    <>
      <PageHeader 
        title="My Profile" 
        description="View and manage your account information."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData.avatar || ''} alt={userData.name} />
              <AvatarFallback className="text-xl">{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{userData.name}</h3>
              <p className="text-muted-foreground">{userData.role}</p>
              <p className="text-muted-foreground">{userData.department}</p>
            </div>
            <Button variant="outline" className="w-full">
              Change Avatar
            </Button>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your profile information and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-4">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="name" 
                              value={userData.name} 
                              onChange={(e) => setUserData({...userData, name: e.target.value})} 
                              className="pl-10" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email" 
                              type="email" 
                              value={userData.email} 
                              onChange={(e) => setUserData({...userData, email: e.target.value})} 
                              className="pl-10" 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="phone" 
                              value={userData.phone} 
                              onChange={(e) => setUserData({...userData, phone: e.target.value})} 
                              className="pl-10" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="department" 
                              value={userData.department} 
                              onChange={(e) => setUserData({...userData, department: e.target.value})} 
                              className="pl-10" 
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="security" className="mt-4">
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="current-password" type="password" className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="new-password" type="password" className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="confirm-new-password" type="password" className="pl-10" required />
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}