import { ButtonHTMLAttributes, forwardRef, ReactNode, memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  children: ReactNode;
  rounded?: boolean;
  shadow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    loadingText,
    children,
    className = '',
    disabled,
    rounded = true,
    shadow = true,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-95',
      rounded ? 'rounded-lg' : '',
      shadow ? 'shadow-sm hover:shadow-md' : '',
      fullWidth ? 'w-full' : '',
    ].filter(Boolean).join(' ');
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent',
      secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 border border-transparent',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 border border-transparent',
      warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 border border-transparent',
      error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 border border-transparent',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 border border-transparent',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    const classes = [
      baseClasses,
      variants[variant],
      sizes[size],
      className,
    ].join(' ');

    const iconClass = iconSizes[size];
    const showLeftIcon = Icon && iconPosition === 'left' && !isLoading;
    const showRightIcon = Icon && iconPosition === 'right' && !isLoading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className={`${iconClass} mr-2 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70`} />
        )}
        
        {showLeftIcon && (
          <Icon className={`${iconClass} ${children ? 'mr-2' : ''}`} />
        )}
        
        {isLoading && loadingText ? loadingText : children}
        
        {showRightIcon && (
          <Icon className={`${iconClass} ${children ? 'ml-2' : ''}`} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button component for when you only want an icon
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: LucideIcon;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 'md', className = '', ...props }, ref) => {
    const sizeMap = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
      xl: 'p-4',
    };

    const iconSizeMap = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={`${sizeMap[size]} ${className}`}
        {...props}
      >
        <Icon className={iconSizeMap[size]} />
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default memo(Button);
