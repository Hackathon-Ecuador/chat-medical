import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';


export interface UserAvatarProps {
  url?: string | null;
  name?: string | null;
  shape?: 'circle' | 'square';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  isOnline?: boolean | null;
  showOnlineIndicator?: boolean;
  className?: string; // Additional classes for the wrapper (e.g. positioning)
}

const circleSizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
  '3xl': 'h-32 w-32 text-3xl',
};

const indicatorSizeClasses = {
  xs: 'h-1.5 w-1.5 right-0 bottom-0 translate-x-[10%] translate-y-[10%]',
  sm: 'h-2.5 w-2.5 right-0 bottom-0 translate-x-[10%] translate-y-[10%]',
  md: 'h-3 w-3 right-0 bottom-0 translate-x-[10%] translate-y-[10%]',
  lg: 'h-3.5 w-3.5 right-0 bottom-0 translate-x-[10%] translate-y-[10%]',
  xl: 'h-4 w-4 right-1 bottom-1 translate-x-[10%] translate-y-[10%]',
  '2xl': 'h-5 w-5 right-2 bottom-2 translate-x-[10%] translate-y-[10%]',
  '3xl': 'h-6 w-6 right-2 bottom-2 translate-x-[10%] translate-y-[10%]',
};

export function UserAvatar({
  url,
  name,
  shape = 'circle',
  size = 'md',
  isOnline = false,
  showOnlineIndicator = false,
  className,
}: UserAvatarProps) {
  const isSquare = shape === 'square';
  const displayUrl = url ?? undefined;
  const initialName = name ?? 'User';

  const wrapperClass = cn('relative flex shrink-0', circleSizeClasses[size]);

  const avatarRadius = isSquare ? 'rounded-lg' : 'rounded-full';

  return (
    <div className={cn(wrapperClass, className)}>
      <Avatar className={cn('h-full w-full border border-neutral-200', avatarRadius)}>
        <AvatarImage
          src={displayUrl}
          alt={initialName}
          className={cn('h-full w-full object-cover', isSquare ? 'rounded-md' : 'rounded-full')}
        />
        <AvatarFallback
          className={cn(
            'flex h-full w-full items-center justify-center bg-cyan-600/10 font-semibold text-cyan-800',
            avatarRadius,
            isSquare ? 'text-2xl md:text-4xl' : '',
          )}
        >
          {getInitials(initialName)}
        </AvatarFallback>
      </Avatar>

      {showOnlineIndicator && (
        <span
          className={cn(
            'absolute z-10 border border-white',
            isSquare
              ? 'right-1 bottom-1 h-3 w-3 translate-x-1/4 translate-y-1/4 rounded-xs md:h-5 md:w-5'
              : cn('rounded-full', indicatorSizeClasses[size]),
            isOnline ? 'bg-emerald-500' : 'bg-gray-400',
          )}
        />
      )}
    </div>
  );
}
