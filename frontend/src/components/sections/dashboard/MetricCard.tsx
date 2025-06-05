import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isLoading?: boolean;
  footer?: string;
};

export function MetricCard({ title, value, icon: Icon, isLoading, footer }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold text-foreground">{value}</div>
        )}
        {footer && !isLoading && (
          <p className="text-xs text-muted-foreground pt-1">{footer}</p>
        )}
         {isLoading && footer && <Skeleton className="h-4 w-1/2 mt-1" />}
      </CardContent>
    </Card>
  );
}
