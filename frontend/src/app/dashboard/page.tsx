'use client';
//hello
import { useState, useEffect } from 'react';
import { DollarSign, Package, AlertTriangle, Truck, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/sections/dashboard/MetricCard';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

type RecentActivity = {
  id: string;
  timestamp: string;
  eventType: string;
  medicine: string;
  details: string;
  location?: string;
};

const mockRecentActivity: RecentActivity[] = [
  { id: '1', timestamp: '2024-07-28 10:00 AM', eventType: 'New Batch', medicine: 'Amoxicillin 250mg', details: 'Batch #AMX250-001 added', location: 'Apex Pharma Inc.' },
  { id: '2', timestamp: '2024-07-28 09:30 AM', eventType: 'Stock Update', medicine: 'Ibuprofen 400mg', details: '500 units received', location: 'City General Hospital' },
  { id: '3', timestamp: '2024-07-27 05:00 PM', eventType: 'Resupply Request', medicine: 'Paracetamol 500mg', details: '1000 units requested', location: 'Downtown Pharmacy' },
  { id: '4', timestamp: '2024-07-27 02:15 PM', eventType: 'Distribution', medicine: 'Metformin 500mg', details: 'Shipped 200 units to Valley Clinic', location: 'Central Stockists' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate data loading
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PageHeader title="PharmaFlow Dashboard" description="Overview of medicine supply chain and stock levels." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard title="Medicines in System" value={loading ? 0 : 1250} icon={Package} isLoading={loading} footer="+20 this week" />
        <MetricCard title="Low Stock Alerts" value={loading ? 0 : 15} icon={AlertTriangle} isLoading={loading} footer="Across 8 pharmacies" />
        <MetricCard title="Items in Transit" value={loading ? 0 : 78} icon={Truck} isLoading={loading} footer="3 new shipments today" />
        <MetricCard title="Forecast Accuracy" value={loading ? "0%" : "92.5%"} icon={BarChart3} isLoading={loading} footer="For last 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-xs">{activity.timestamp}</TableCell>
                    <TableCell>{activity.eventType}</TableCell>
                    <TableCell>{activity.medicine}</TableCell>
                    <TableCell className="text-xs">{activity.details}</TableCell>
                    <TableCell>{activity.location || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Supply Chain Visualization" 
              width={600} 
              height={400} 
              className="rounded-md object-cover"
              data-ai-hint="supply chain" 
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Visualizing the flow of medicines from manufacturers to consumers.
              AI-powered analytics help optimize distribution and prevent shortages.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
