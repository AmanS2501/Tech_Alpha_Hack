'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Building, PackageCheck, SendToBack, ListChecks, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type PharmacyStockItem = {
  id: string;
  medicineName: string;
  batchNumber: string;
  quantityOnHand: number;
  lastUpdated: string;
};

const mockPharmacyStock: PharmacyStockItem[] = [
  { id: '1', medicineName: 'Amoxicillin 250mg', batchNumber: 'AMX250-A01', quantityOnHand: 150, lastUpdated: '2024-07-28' },
  { id: '2', medicineName: 'Ibuprofen 400mg', batchNumber: 'IBU400-B02', quantityOnHand: 80, lastUpdated: '2024-07-28' },
  { id: '3', medicineName: 'Paracetamol 500mg', batchNumber: 'PARA500-C03', quantityOnHand: 200, lastUpdated: '2024-07-27' },
];

export default function PharmacyPage() {
  const [stock, setStock] = useState<PharmacyStockItem[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setTimeout(() => {
      setStock(mockPharmacyStock);
      setLoadingStock(false);
    }, 1000);
  }, []);
  
  const handleStockUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: "Stock Updated", description: "Your stock levels have been recorded."});
    // Add actual form submission logic
  };

  const handleResupplyRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: "Resupply Requested", description: "Your request has been sent."});
     // Add actual form submission logic
  };

  return (
    <>
      <PageHeader
        title="Pharmacy Stock Management"
        description="Update your current stock levels and request resupply for medicines."
      />
      <Tabs defaultValue="currentStock" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="currentStock"><ListChecks className="mr-2 h-4 w-4" />Current Stock</TabsTrigger>
          <TabsTrigger value="updateStock"><PackageCheck className="mr-2 h-4 w-4" />Update Stock</TabsTrigger>
          <TabsTrigger value="requestResupply"><SendToBack className="mr-2 h-4 w-4" />Request Resupply</TabsTrigger>
        </TabsList>
        
        <TabsContent value="currentStock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" /> Your Current Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Batch No.</TableHead>
                    <TableHead>Quantity On Hand</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStock ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : stock.length > 0 ? (
                    stock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{item.quantityOnHand.toLocaleString()}</TableCell>
                        <TableCell>{item.lastUpdated}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" aria-label="Edit item">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No stock items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updateStock">
          <Card>
            <CardHeader>
              <CardTitle>Update Medicine Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockUpdate} className="space-y-4 max-w-lg">
                <div>
                  <Label htmlFor="update-medicineName">Medicine Name</Label>
                  <Input id="update-medicineName" placeholder="e.g., Amoxicillin 250mg" required />
                </div>
                <div>
                  <Label htmlFor="update-batchNumber">Batch Number / Barcode</Label>
                  <Input id="update-batchNumber" placeholder="e.g., AMX250-A01" required />
                </div>
                <div>
                  <Label htmlFor="update-quantity">Current Quantity On Hand</Label>
                  <Input id="update-quantity" type="number" placeholder="e.g., 150" required />
                </div>
                <div>
                  <Label htmlFor="update-date">Date of Update</Label>
                  <Input id="update-date" type="date" defaultValue={new Date().toISOString().substring(0,10)} required />
                </div>
                <Button type="submit">Submit Stock Update</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requestResupply">
          <Card>
            <CardHeader>
              <CardTitle>Request Medicine Resupply</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResupplyRequest} className="space-y-4 max-w-lg">
                <div>
                  <Label htmlFor="request-medicineName">Medicine Name</Label>
                  <Input id="request-medicineName" placeholder="e.g., Paracetamol 500mg" required />
                </div>
                <div>
                  <Label htmlFor="request-quantity">Required Quantity</Label>
                  <Input id="request-quantity" type="number" placeholder="e.g., 1000" required />
                </div>
                <div>
                  <Label htmlFor="request-urgency">Urgency</Label>
                   <Select defaultValue="normal">
                    <SelectTrigger id="request-urgency">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="request-notes">Notes (Optional)</Label>
                  <Textarea id="request-notes" placeholder="Additional details or reasons for the request." />
                </div>
                <Button type="submit">Submit Resupply Request</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
