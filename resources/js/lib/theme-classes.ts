/**
 * Centralized theme class definitions for consistent dark mode styling
 * This makes it easy to update theme colors globally
 */

export const themeClasses = {
    // Text colors
    text: {
        primary: 'text-gray-900 dark:text-gray-100',
        secondary: 'text-gray-700 dark:text-gray-300',
        tertiary: 'text-gray-500 dark:text-gray-400',
    },

    // Background colors
    bg: {
        primary: 'bg-white dark:bg-black',
        secondary: 'bg-white dark:bg-black',
        tertiary: 'bg-gray-50 dark:bg-neutral-900',
        accent: 'bg-gray-100 dark:bg-neutral-900',
        muted: 'bg-gray-100 dark:bg-neutral-900',
    },

    // Border colors
    border: {
        primary: 'border-gray-200 dark:border-gray-800',
        secondary: 'border-gray-300 dark:border-gray-800',
        light: 'border-gray-100 dark:border-gray-900',
    },

    // Button states
    button: {
        primary: 'bg-[#690383] text-white hover:bg-[#B51297]',
        secondary: 'text-gray-900 dark:text-gray-100 bg-white hover:bg-gray-100 dark:bg-black dark:hover:bg-neutral-900 border border-gray-200 dark:border-gray-800',
        ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900',
    },

    // Status badge colors
    badge: {
        blue: 'text-gray-900 dark:text-gray-100',
        green: 'text-gray-900 dark:text-gray-100',
        orange: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        red: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        yellow: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        purple: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
    },

    // Status-specific colors (for project workflow)
    status: {
        for_evaluation: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        revision: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        approved: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        declined: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        review: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        for_certification: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        certified: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
        unknown: 'bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100',
    },

    // Alert/Message backgrounds
    alert: {
        error: 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
        success: 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
        warning: 'bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
        info: 'border-gray-200 bg-gray-100 dark:bg-neutral-900 dark:border-gray-800',
    },

    // Card styling
    card: {
        base: 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800',
        hover: 'hover:shadow-sm',
    },

    // Gradient backgrounds for cards
    gradient: {
        blue: 'from-gray-200 to-gray-300',
        purple: 'from-gray-200 to-gray-300',
        emerald: 'from-gray-100 to-gray-200 dark:from-neutral-900 dark:to-neutral-800',
    },

    // Border accent colors for cards
    borderAccent: {
        blue: 'border-gray-300 dark:border-gray-800',
        purple: 'border-gray-300 dark:border-gray-800',
        emerald: 'border-gray-200 dark:border-gray-800',
        green: 'border-gray-200 dark:border-gray-800',
    },

    // Input styling
    input: {
        base: 'border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-gray-100',
        focus: 'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 focus:border-gray-400',
        placeholder: 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    },

    // Table styling
    table: {
        header: 'bg-gray-50 dark:bg-neutral-900',
        body: 'bg-white dark:bg-black',
        border: 'divide-gray-200 dark:divide-gray-800',
        row: 'hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors',
    },

    // Link colors
    link: {
        primary: 'text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300',
        secondary: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
    },

    // Icon colors
    icon: {
        muted: 'text-gray-500 dark:text-gray-500',
        primary: 'text-gray-900 dark:text-gray-100',
    },
} as const;

/**
 * Utility function to combine multiple theme classes
 */
export function combineTheme(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
