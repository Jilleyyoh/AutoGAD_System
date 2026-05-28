import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: Props) {
    const baseClasses = 'inline-flex justify-center border px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses = {
        primary: 'border-black bg-black text-white hover:bg-white hover:text-black focus-visible:outline-black',
        secondary: 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
        danger: 'border-black bg-black text-white hover:bg-white hover:text-black focus-visible:outline-black',
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
