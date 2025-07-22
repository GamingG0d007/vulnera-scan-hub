import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  percentage: string;
  trend: 'up' | 'down' | 'neutral';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  icon: LucideIcon;
}

const getSeverityStyles = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 'border-l-severity-critical bg-gradient-to-r from-severity-critical/10 to-transparent';
    case 'high':
      return 'border-l-severity-high bg-gradient-to-r from-severity-high/10 to-transparent';
    case 'medium':
      return 'border-l-severity-medium bg-gradient-to-r from-severity-medium/10 to-transparent';
    case 'low':
      return 'border-l-severity-low bg-gradient-to-r from-severity-low/10 to-transparent';
    default:
      return 'border-l-primary bg-gradient-to-r from-primary/10 to-transparent';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-destructive';
    case 'down':
      return 'text-success';
    default:
      return 'text-muted-foreground';
  }
};

export const StatCard = ({
  title,
  count,
  percentage,
  trend,
  severity,
  icon: Icon
}: StatCardProps) => {
  return (
    <Card className={cn(
      "p-6 border-l-4 hover:shadow-glow transition-all duration-300",
      getSeverityStyles(severity)
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{count}</p>
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm font-medium", getTrendColor(trend))}>
              {percentage}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-full",
          severity ? `bg-severity-${severity}/20` : 'bg-primary/20'
        )}>
          <Icon className={cn(
            "h-6 w-6",
            severity ? `text-severity-${severity}` : 'text-primary'
          )} />
        </div>
      </div>
    </Card>
  );
};