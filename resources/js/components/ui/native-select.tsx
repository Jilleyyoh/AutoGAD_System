import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function NativeSelect({ className, children, disabled, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select
                className={cn(
                    className,
                    'block w-full appearance-none pr-12',
                    disabled && 'cursor-not-allowed opacity-70',
                )}
                disabled={disabled}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        </div>
    );
}

export { NativeSelect };
