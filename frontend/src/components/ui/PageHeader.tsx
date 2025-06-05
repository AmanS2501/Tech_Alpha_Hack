import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {typeof description === 'string' ? description : description}
            </p>
          )}
        </div>
        {actions && <div className="mt-4 sm:mt-0 sm:ml-4">{actions}</div>}
      </div>
    </div>
  );
}
