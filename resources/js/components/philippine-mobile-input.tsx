import * as React from 'react';

import { cn } from '@/lib/utils';

function normalizePhilippineMobileNumber(value: string) {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('63')) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.startsWith('09')) {
    return digits.slice(0, 11);
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    return `0${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(0, 11);
  }

  if (digits.length >= 9) {
    return `09${digits.slice(-9)}`;
  }

  return '09';
}

function getLocalDigits(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('63')) {
    return digits.slice(2, 12);
  }

  if (digits.startsWith('09')) {
    return digits.slice(1, 11);
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1, 11);
  }

  if (digits.length === 10) {
    return digits.slice(0, 10);
  }

  return digits.slice(-10);
}

function formatLocalDigits(value: string) {
  const digits = value.slice(0, 10);
  const first = digits.slice(0, 3);
  const second = digits.slice(3, 6);
  const third = digits.slice(6, 10);

  return [first, second, third].filter(Boolean).join(' ');
}

type PhilippineMobileInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: string;
  onValueChange: (value: string) => void;
};

function PhilippineMobileInput({
  value,
  onValueChange,
  className,
  placeholder = '960 878 3967',
  ...props
}: PhilippineMobileInputProps) {
  const localDigits = getLocalDigits(value);

  return (
    <div className="relative mt-1">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-normal text-gray-400 dark:text-gray-500"
      >
        (+63)
      </span>
      <input
        {...props}
        value={formatLocalDigits(localDigits)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(-10);
          onValueChange(digits ? `0${digits}` : '09');
        }}
        inputMode="numeric"
        maxLength={13}
        placeholder={placeholder}
        className={cn(
          'block w-full min-w-0 rounded-md border border-gray-300 py-2 pl-16 pr-3 text-base shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white',
          className,
        )}
      />
    </div>
  );
}

export { PhilippineMobileInput, normalizePhilippineMobileNumber };
