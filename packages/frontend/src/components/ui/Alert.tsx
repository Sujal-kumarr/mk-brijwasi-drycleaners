import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = 'info', title, children, className }: AlertProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 icon-text-blue-500',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-text-emerald-500',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-text-amber-500',
    danger: 'bg-red-50 border-red-200 text-red-800 icon-text-red-500',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    danger: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  };

  return (
    <div className={cn('p-4 rounded-lg border flex gap-3 text-sm', styles[type], className)}>
      {icons[type]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}
