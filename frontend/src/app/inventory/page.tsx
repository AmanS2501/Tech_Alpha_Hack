
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/PageHeader';
import { Boxes, Edit, PlusCircle, Search, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type InventoryItem = {
  id: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  location: string; // Within stockist
  status: 'Awaiting Distribution' | 'In Transit' | 'Delivered' | 'Low Stock';
  lastUpdated: string;
};

const mockInventory: InventoryItem[] = [
  { id: '1', medicineName: 'Amoxicillin 500mg', batchNumber: 'AMX500-001', quantity: 5000, location: 'Shelf A1', status: 'Awaiting Distribution', lastUpdated: '2024-07-28' },
  { id: '2', medicineName: 'Ibuprofen 400mg', batchNumber: 'IBU400-005', quantity: 250, location: 'Cold Storage 1', status: 'Low Stock', lastUpdated: '2024-07-27' },
  { id: '3', medicineName: 'Paracetamol 500mg', batchNumber: 'PARA500-010', quantity: 1200, location: 'Shelf B3', status: 'In Transit', lastUpdated: '2024-07-26' },
  { id: '4', medicineName: 'Metformin 500mg', batchNumber: 'MET500-002', quantity: 3000, location: 'Shelf C2', status: 'Delivered', lastUpdated: '2024-07-25' },
];

const statusColors: Record<InventoryItem['status'], string> = {
  'Awaiting Distribution': 'bg-blue-100 text-blue-700 border-blue-300',
  'In Transit': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Delivered': 'bg-green-100 text-green-700 border-green-300',
  'Low Stock': 'bg-red-100 text-red-700 border-red-300',
};


export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PageActions = () => (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Stock</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stock Item</DialogTitle>
            <DialogDescription>Manually add a new medicine stock item to the inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Add form fields here */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medName" className="text-right">Medicine Name</Label>
              <Input id="medName" placeholder="Amoxicillin 500mg" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchNum" className="text-right">Batch No.</Label>
              <Input id="batchNum" placeholder="AMX500-001" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qty" className="text-right">Quantity</Label>
              <Input id="qty" type="number" placeholder="1000" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline"><Truck className="mr-2 h-4 w-4" /> Record Distribution</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Medicine Distribution</DialogTitle>
            <DialogDescription>Log medicine distribution to a pharmacy or hospital.</DialogDescription>
          </DialogHeader>
           {/* Add form fields here */}
          <DialogFooter>
            <Button type="submit">Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );


  return (
    <>
      <PageHeader
        title="Stockist Inventory Management"
        description="View, track, and manage medicine inventory."
        actions={<PageActions />}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" /> Current Inventory
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or batch..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Batch No.</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.medicineName}</TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell>{item.quantity.toLocaleString()}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border", statusColors[item.status])}>
                        {item.status}
                      </Badge>
                    </TableCell>
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
                  <TableCell colSpan={7} className="text-center">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

