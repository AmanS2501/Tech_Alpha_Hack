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
import { Shuffle, Loader2, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const redirectionFormSchema = z.object({
  stockLevels: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
      } catch (e) {
        return false;
      }
    },
    { message: 'Stock levels must be a valid JSON object (key-value map).' }
  ),
  demandForecasts: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
      } catch (e) {
        return false;
      }
    },
    { message: 'Demand forecasts must be a valid JSON object (key-value map).' }
  ),
  redirectionThreshold: z.coerce.number().min(0).max(1).default(0.2),
});

type RedirectionFormValues = z.infer<typeof redirectionFormSchema>;

const stockLevelsPlaceholder = `Example (JSON Object):
{
  "PharmacyA_Amoxicillin": 100,
  "PharmacyB_Amoxicillin": 20,
  "HospitalX_Ibuprofen": 50
}`;

const demandForecastsPlaceholder = `Example (JSON Object):
{
  "PharmacyA_Amoxicillin": 50,
  "PharmacyB_Amoxicillin": 80,
  "HospitalX_Ibuprofen": 75
}`;


export default function RedirectionPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // const [aiResult, setAiResult] = useState<RedirectionSuggestionsOutput | null>(null); // AI Result removed

  const form = useForm<RedirectionFormValues>({
    resolver: zodResolver(redirectionFormSchema),
    defaultValues: {
      stockLevels: '',
      demandForecasts: '',
      redirectionThreshold: 0.2,
    },
  });

  async function onSubmit(data: RedirectionFormValues) {
    setIsLoading(true);
    // setAiResult(null); // AI Result removed
    console.log('Redirection form data:', data);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // AI Call removed
      // const input: RedirectionSuggestionsInput = {
      //   stockLevels: JSON.parse(data.stockLevels),
      //   demandForecasts: JSON.parse(data.demandForecasts),
      //   redirectionThreshold: data.redirectionThreshold,
      // };
      // const result = await generateRedirectionSuggestions(input);
      // setAiResult(result);
      toast({
        title: 'Data Submitted',
        description: 'Your redirection data has been submitted (AI processing removed).',
      });
    } catch (error) {
      console.error('Error submitting redirection data:', error);
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
        title="Redirection Suggestions"
        // description="Input data for stock redirection (AI features removed)."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" /> Redirection Input
            </CardTitle>
            <CardDescription>Provide data for stock redirection.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="stockLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock Levels (JSON Object)</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder={stockLevelsPlaceholder} {...field} />
                      </FormControl>
                      <FormDescription>Key: Location_MedicineName, Value: Quantity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="demandForecasts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demand Forecasts (JSON Object)</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder={demandForecastsPlaceholder} {...field} />
                      </FormControl>
                       <FormDescription>Key: Location_MedicineName, Value: Forecasted Quantity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redirectionThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirection Threshold (0-1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" max="1" {...field} />
                      </FormControl>
                      <FormDescription>Threshold for suggesting redirection based on stock vs. demand.</FormDescription>
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
            {/* <CardDescription>Results would appear here (AI processing removed).</CardDescription> */}
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
              aiResult.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiResult.map((suggestion, index) => (
                      <TableRow key={index}>
                        <TableCell>{suggestion.medicineName}</TableCell>
                        <TableCell>{suggestion.sourceLocation}</TableCell>
                        <TableCell>{suggestion.destinationLocation}</TableCell>
                        <TableCell>{suggestion.quantity}</TableCell>
                        <TableCell className="text-xs">{suggestion.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No Suggestions</AlertTitle>
                  <AlertDescription>
                    Based on the current input, no redirection suggestions are necessary.
                  </AlertDescription>
                </Alert>
              )
            )} */}
          </CardContent>
          {/* <CardFooter><p className="text-xs text-muted-foreground">Suggestions generated by AI.</p></CardFooter> */}
        </Card>
      </div>
    </>
  );
}
