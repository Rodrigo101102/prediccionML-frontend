import React, { InputHTMLAttributes, forwardRef, useState, useCallback } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, LucideIcon } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon | React.ReactNode;
  rightIcon?: LucideIcon | React.ReactNode;
  isPassword?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  success?: boolean;
  loading?: boolean;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    isPassword = false,
    size = 'md',
    variant = 'default',
    success = false,
    loading = false,
    debounceMs = 0,
    onDebouncedChange,
    className = '',
    type = 'text',
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      
      // Call original onChange immediately
      if (onChange) {
        onChange(event);
      }

      // Handle debounced change
      if (onDebouncedChange && debounceMs > 0) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        
        const timeout = setTimeout(() => {
          onDebouncedChange(value);
        }, debounceMs);
        
        setDebounceTimeout(timeout);
      }
    }, [onChange, onDebouncedChange, debounceMs, debounceTimeout]);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizeClasses = {
      sm: 'py-1.5 text-sm',
      md: 'py-2.5 text-sm',
      lg: 'py-3 text-base',
    };

    const variantClasses = {
      default: 'border-gray-300 bg-white',
      filled: 'border-gray-200 bg-gray-50 focus:bg-white',
      outlined: 'border-2 border-gray-300 bg-white',
    };

    const getStateClasses = () => {
      if (error) {
        return 'border-error-300 text-error-900 focus:border-error-500 focus:ring-error-500 bg-error-50';
      }
      if (success) {
        return 'border-success-300 focus:border-success-500 focus:ring-success-500 bg-success-50';
      }
      return 'focus:border-primary-500 focus:ring-primary-500';
    };

    const baseClasses = [
      'block w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100',
      variantClasses[variant],
      sizeClasses[size],
      getStateClasses(),
    ].join(' ');

    const paddingClasses = leftIcon ? 'pl-10' : 'pl-3';
    const rightPaddingClasses = (rightIcon || isPassword || error || success || loading) ? 'pr-10' : 'pr-3';

    const inputClasses = [
      baseClasses,
      paddingClasses,
      rightPaddingClasses,
      className,
    ].join(' ');

    const iconSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const iconSize = iconSizeClasses[size];

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {React.isValidElement(leftIcon) ? (
                leftIcon
              ) : (
                React.createElement(leftIcon as LucideIcon, { className: `${iconSize} text-gray-400` })
              )}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            onChange={handleChange}
            {...props}
          />
          
          {/* Right Icons */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
            {/* Loading Spinner */}
            {loading && (
              <div className={`${iconSize} animate-spin border-2 border-gray-300 border-t-primary-600 rounded-full`} />
            )}
            
            {/* Success Icon */}
            {success && !loading && (
              <CheckCircle2 className={`${iconSize} text-success-500`} />
            )}
            
            {/* Error Icon */}
            {error && !loading && (
              <AlertCircle className={`${iconSize} text-error-500`} />
            )}
            
            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                className={`${iconSize} text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            )}
            
            {/* Custom Right Icon */}
            {rightIcon && !isPassword && !error && !success && !loading && (
              React.isValidElement(rightIcon) ? (
                rightIcon
              ) : (
                React.createElement(rightIcon as LucideIcon, { className: `${iconSize} text-gray-400` })
              )
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 text-error-500 mr-1 flex-shrink-0" />
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component with similar styling
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText,
    resize = 'vertical',
    className = '',
    ...props 
  }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const baseClasses = [
      'block w-full rounded-lg border-gray-300 shadow-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100',
      'px-3 py-2.5 text-sm',
      resizeClasses[resize],
      error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : '',
      className,
    ].join(' ');

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={baseClasses}
          {...props}
        />
        
        {error && (
          <div className="mt-2 flex items-center">
            <AlertCircle className="h-4 w-4 text-error-500 mr-1 flex-shrink-0" />
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
