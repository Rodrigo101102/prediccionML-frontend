import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface SkeletonCardProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  textLines?: number;
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height = '1rem',
  rounded = true,
  animation = 'pulse',
}) => {
  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse-slow',
    none: '',
  }[animation];

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-gray-200 ${rounded ? 'rounded' : ''} ${animationClass} ${className}`}
      style={style}
    />
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      className={`${sizeMap[size]} rounded-lg ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasHeader = true,
  hasFooter = false,
  textLines = 3,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {hasHeader && (
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-6 rounded-full mr-3" />
          <Skeleton height="1.5rem" width="40%" />
        </div>
      )}
      
      {children || <SkeletonText lines={textLines} />}
      
      {hasFooter && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard skeleton for the main page
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Skeleton height="1.5rem" width="200px" />
            <SkeletonButton />
          </div>
          <div className="mt-4">
            <Skeleton height="2rem" width="60%" />
            <div className="mt-2">
              <Skeleton height="1.25rem" width="30%" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Control panel skeleton */}
          <SkeletonCard hasHeader textLines={2} className="p-6">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Skeleton height="1rem" width="40%" className="mb-2" />
                <Skeleton height="2.5rem" />
              </div>
              <div>
                <Skeleton height="1rem" width="40%" className="mb-2" />
                <Skeleton height="2.5rem" />
              </div>
              <div>
                <Skeleton height="2.5rem" />
              </div>
            </div>
          </SkeletonCard>

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard
                key={index}
                hasHeader={false}
                textLines={1}
                className="p-4"
              >
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                  <div className="flex-1">
                    <Skeleton height="1rem" width="60%" className="mb-2" />
                    <Skeleton height="1.5rem" width="40%" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>

          {/* Results skeleton */}
          <SkeletonCard hasHeader textLines={5} hasFooter />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
