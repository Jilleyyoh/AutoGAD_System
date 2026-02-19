/**
 * Centralized theme class definitions for consistent dark mode styling
 * This makes it easy to update theme colors globally
 */

export const themeClasses = {
    // Text colors
    text: {
        primary: 'text-gray-900 dark:text-white',
        secondary: 'text-gray-600 dark:text-gray-400',
        tertiary: 'text-gray-500 dark:text-gray-500',
    },

    // Background colors
    bg: {
        primary: 'bg-white dark:bg-slate-900',
        secondary: 'bg-white dark:bg-slate-800',
        tertiary: 'bg-gray-50 dark:bg-slate-700',
        accent: 'bg-blue-50 dark:bg-slate-800',
        muted: 'bg-gray-100 dark:bg-slate-700',
    },

    // Border colors
    border: {
        primary: 'border-gray-200 dark:border-gray-700',
        secondary: 'border-gray-300 dark:border-slate-600',
        light: 'border-gray-100 dark:border-slate-800',
    },

    // Button states
    button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'text-gray-900 dark:text-gray-100 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600',
        ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700',
    },

    // Status badge colors
    badge: {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-100',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-100',
        purple: 'bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-100',
    },

    // Status-specific colors (for project workflow)
    status: {
        for_evaluation: 'bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-100', // Blue = For Evaluation
        revision: 'bg-yellow-100 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-100', // Yellow = Revision
        approved: 'bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-100', // Green = Approved
        declined: 'bg-red-100 dark:bg-red-900/70 text-red-800 dark:text-red-100', // Red = Declined
        review: 'bg-orange-100 dark:bg-orange-900/70 text-orange-800 dark:text-orange-100', // Orange = Review
        for_certification: 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-100', // Indigo = For Certification
        certified: 'bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-100', // Purple = Certified
        unknown: 'bg-gray-100 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100', // Gray = Unknown/Neutral
    },

    // Alert/Message backgrounds
    alert: {
        error: 'bg-red-50 dark:bg-red-900/60 border-red-200 dark:border-red-700 text-red-700 dark:text-red-100',
        success: 'bg-green-50 dark:bg-green-900/60 border-green-200 dark:border-green-700 text-green-700 dark:text-green-100',
        warning: 'bg-yellow-50 dark:bg-yellow-900/60 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    },

    // Card styling
    card: {
        base: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        hover: 'hover:shadow-lg dark:hover:shadow-slate-900/50',
    },

    // Gradient backgrounds for cards
    gradient: {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-600 to-purple-700',
        emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800',
    },

    // Border accent colors for cards
    borderAccent: {
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        emerald: 'border-emerald-200 dark:border-emerald-700',
        green: 'border-green-200 dark:border-green-700',
    },

    // Input styling
    input: {
        base: 'border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100',
        focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500',
        placeholder: 'placeholder:text-gray-400 dark:placeholder:text-slate-400',
    },

    // Table styling
    table: {
        header: 'bg-gray-50 dark:bg-slate-700',
        body: 'bg-white dark:bg-slate-800',
        border: 'divide-gray-200 dark:divide-slate-700',
        row: 'hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors',
    },

    // Link colors
    link: {
        primary: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
        secondary: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
    },

    // Icon colors
    icon: {
        muted: 'text-gray-400 dark:text-gray-500',
        primary: 'text-gray-900 dark:text-gray-100',
    },
} as const;

/**
 * Utility function to combine multiple theme classes
 */
export function combineTheme(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
