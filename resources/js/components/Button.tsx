import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: Props) {
    const baseClasses = 'inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600',
        secondary: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600'
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <button
            type="button"
            className={combinedClasses}
            {...props}
        >
            {children}
        </button>
    );
}