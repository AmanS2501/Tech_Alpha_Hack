'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserPlus, LogIn, Mail, Lock, User, Building, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();
  const router = useRouter();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    profile: {
      role: 'pharmacist' as 'manufacturer' | 'stockist' | 'pharmacist',
      organization: '',
      phone: ''
    }
  });
  
  const [error, setError] = useState('');

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.id]: e.target.value
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id.startsWith('profile-')) {
      const field = id.replace('profile-', '');
      setRegisterData({
        ...registerData,
        profile: {
          ...registerData.profile,
          [field]: value
        }
      });
    } else {
      setRegisterData({
        ...registerData,
        [id]: value
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setRegisterData({
      ...registerData,
      profile: {
        ...registerData.profile,
        role: value as 'manufacturer' | 'stockist' | 'pharmacist'
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(loginData);
      // The redirect will be handled by AuthCheck component
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.password2) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register(registerData);
      // The redirect will be handled by AuthCheck component
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <>
      <PageHeader 
        title="Authentication" 
        description="Sign in to your account or create a new one."
      />
      
      <div className="flex justify-center items-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>
              
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4">
                  {error}
                </div>
              )}
              
              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="username" 
                          placeholder="username" 
                          className="pl-10" 
                          required 
                          value={loginData.username}
                          onChange={handleLoginChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10" 
                          required 
                          value={loginData.password}
                          onChange={handleLoginChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-4">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="username" 
                          placeholder="username" 
                          className="pl-10" 
                          required 
                          value={registerData.username}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          placeholder="name@example.com" 
                          type="email" 
                          className="pl-10" 
                          required 
                          value={registerData.email}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input 
                          id="first_name" 
                          placeholder="John" 
                          value={registerData.first_name}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input 
                          id="last_name" 
                          placeholder="Doe" 
                          value={registerData.last_name}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        onValueChange={handleRoleChange} 
                        defaultValue={registerData.profile.role}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manufacturer">Manufacturer</SelectItem>
                          <SelectItem value="stockist">Stockist</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-organization">Organization</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="profile-organization" 
                          placeholder="Your organization" 
                          className="pl-10" 
                          value={registerData.profile.organization}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="profile-phone" 
                          placeholder="Your phone number" 
                          className="pl-10" 
                          value={registerData.profile.phone}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10" 
                          required 
                          value={registerData.password}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password2" 
                          type="password" 
                          className="pl-10" 
                          required 
                          value={registerData.password2}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}