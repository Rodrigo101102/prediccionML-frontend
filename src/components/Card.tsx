import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const roundedMap = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  shadow = 'md',
  rounded = 'xl',
  border = true,
  hoverable = false,
  onClick,
}) => {
  const baseClasses = [
    'bg-white',
    'transition-all',
    'duration-300',
    paddingMap[padding],
    shadowMap[shadow],
    roundedMap[rounded],
    border ? 'border border-gray-100' : '',
    hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={baseClasses} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  icon: Icon,
  iconColor = 'text-primary-600',
  title,
  subtitle,
  actions,
}) => {
  const hasIconOrTitle = Icon || title;

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center">
        {Icon && (
          <div className={`mr-3 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          )}
          {!hasIconOrTitle && children}
        </div>
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
      {hasIconOrTitle && children && (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return <div className={`${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

// Stat Card component for metrics
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    icon: 'text-primary-600',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    icon: 'text-success-600',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    icon: 'text-warning-600',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-600',
    icon: 'text-error-600',
  },
  info: {
    bg: 'bg-info-50',
    text: 'text-info-600',
    icon: 'text-info-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className = '',
}) => {
  const colors = colorMap[color];

  return (
    <Card className={className} hoverable>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            {trend && (
              <span
                className={`ml-2 text-sm ${
                  trend.isPositive ? 'text-success-600' : 'text-error-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
                {trend.label && ` ${trend.label}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Card;