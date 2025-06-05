'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const forecastingFormSchema = z.object({
  medicineName: z.string().min(2, 'Medicine name is required.'),
  historicalData: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: 'Historical data must be valid JSON.' }
  ),
  currentStockLevels: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: 'Current stock levels must be valid JSON.' }
  ),
});

type ForecastingFormValues = z.infer<typeof forecastingFormSchema>;

const historicalDataPlaceholder = `Example:
[
  {"date": "2023-01-01", "demand": 100, "region": "North"},
  {"date": "2023-02-01", "demand": 120, "region": "North"},
  {"date": "2023-01-15", "demand": 80, "region": "South"}
]`;

const currentStockPlaceholder = `Example:
[
  {"pharmacy": "City Hospital", "stock": 50, "medicine": "Amoxicillin"},
  {"pharmacy": "Downtown Pharmacy", "stock": 30, "medicine": "Amoxicillin"}
]`;

export default function ForecastingPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // const [aiResult, setAiResult] = useState<ForecastDemandOutput | null>(null); // AI Result removed

  const form = useForm<ForecastingFormValues>({
    resolver: zodResolver(forecastingFormSchema),
    defaultValues: {
      medicineName: '',
      historicalData: '',
      currentStockLevels: '',
    },
  });

  async function onSubmit(data: ForecastingFormValues) {
    setIsLoading(true);
    // setAiResult(null); // AI Result removed
    console.log('Forecasting form data:', data);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // AI Call removed
      // const input: ForecastDemandInput = {
      //   medicineName: data.medicineName,
      //   historicalData: data.historicalData,
      //   currentStockLevels: data.currentStockLevels,
      // };
      // const result = await forecastDemand(input);
      // setAiResult(result);
      toast({
        title: 'Data Submitted',
        description: 'Your forecasting data has been submitted (AI processing removed).',
      });
    } catch (error) {
      console.error('Error submitting forecast data:', error);
      toast({
        title: 'Error',
        description: `Failed to submit data. ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Demand Forecasting"
        description="Input data for demand forecasting (AI features removed)."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> Forecast Input
            </CardTitle>
            <CardDescription>Provide data to generate a demand forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="medicineName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Amoxicillin 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="historicalData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Demand Data (JSON)</FormLabel>
                      <FormControl>
                        <Textarea rows={8} placeholder={historicalDataPlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>Provide historical demand data as a JSON array.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentStockLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock Levels (JSON)</FormLabel>
                      <FormControl>
                        <Textarea rows={8} placeholder={currentStockPlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>Provide current stock levels as a JSON array.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Data...
                    </>
                  ) : (
                    'Submit Data'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="md:sticky md:top-20 self-start">
          <CardHeader>
            <CardTitle>Output Area</CardTitle>
            <CardDescription>Results would appear here (AI processing removed).</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && ( // Show loader only when submitting
               <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Processing your request...</p>
              </div>
            )}
            {!isLoading && ( // Always show awaiting input when not loading
              <Alert variant="default">
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle>Awaiting Input</AlertTitle>
                <AlertDescription>
                  Please fill out the form and click "Submit Data".
                </AlertDescription>
              </Alert>
            )}
            {/* AI Result display removed */}
            {/* {aiResult && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Forecasted Demand:</h3>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(aiResult.forecastedDemand), null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Redirection Suggestions:</h3>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(aiResult.redirectionSuggestions), null, 2)}
                  </pre>
                </div>
              </div>
            )} */}
          </CardContent>
           {/* <CardFooter><p className="text-xs text-muted-foreground">Results generated by AI.</p></CardFooter> */}
        </Card>
      </div>
    </>
  );
}
