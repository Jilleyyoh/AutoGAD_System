import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        // Normalize the name to lowercase to handle case-sensitivity issues
        const normalizedName = name.toLowerCase();
        return resolvePageComponent(`./pages/${normalizedName}.tsx`, import.meta.glob('./pages/**/*.tsx'));
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Add data-page attribute to help with CSS targeting
        if (props.initialPage && props.initialPage.component) {
            document.documentElement.dataset.page = props.initialPage.component;
        }
        
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
