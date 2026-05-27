import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AlertTone = 'error' | 'warning' | 'success' | 'info';

type AlertItem = {
    id: number;
    message: string;
    tone: AlertTone;
};

type AlertContextValue = {
    notify: (message: string, tone?: AlertTone) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const toneStyles: Record<AlertTone, { icon: typeof Info; ring: string; iconClass: string; title: string }> = {
    error: {
        icon: AlertCircle,
        ring: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/70 dark:text-red-100',
        iconClass: 'text-red-600 dark:text-red-300',
        title: 'Action needed',
    },
    warning: {
        icon: TriangleAlert,
        ring: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100',
        iconClass: 'text-amber-600 dark:text-amber-300',
        title: 'Please check',
    },
    success: {
        icon: CheckCircle2,
        ring: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100',
        iconClass: 'text-emerald-600 dark:text-emerald-300',
        title: 'Success',
    },
    info: {
        icon: Info,
        ring: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-100',
        iconClass: 'text-blue-600 dark:text-blue-300',
        title: 'Notice',
    },
};

function cleanMessage(message: string) {
    return message
        .replace(/^[\s❌⚠️✅]+/, '')
        .replace(/^(âŒ|âš ï¸|âœ…)\s*/, '')
        .replace(/^warning:\s*/i, '')
        .trim();
}

function inferTone(message: string): AlertTone {
    const normalized = message.toLowerCase();

    if (message.includes('❌') || message.includes('âŒ') || normalized.includes('error') || normalized.includes('failed')) {
        return 'error';
    }

    if (message.includes('⚠') || message.includes('âš ') || normalized.includes('warning') || normalized.includes('cannot')) {
        return 'warning';
    }

    if (message.includes('✅') || message.includes('âœ…') || normalized.includes('success')) {
        return 'success';
    }

    return 'info';
}

export function AppAlertsProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setAlerts((current) => current.filter((alert) => alert.id !== id));
    }, []);

    const notify = useCallback(
        (message: string, tone?: AlertTone) => {
            const rawMessage = String(message || 'Something needs your attention.');
            const alert: AlertItem = {
                id: Date.now() + Math.random(),
                message: cleanMessage(rawMessage),
                tone: tone ?? inferTone(rawMessage),
            };

            setAlerts((current) => [...current.slice(-2), alert]);
            window.setTimeout(() => dismiss(alert.id), 5200);
        },
        [dismiss],
    );

    useEffect(() => {
        const originalAlert = window.alert;

        window.alert = (message?: unknown) => {
            notify(String(message ?? 'Something needs your attention.'));
        };

        return () => {
            window.alert = originalAlert;
        };
    }, [notify]);

    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <AlertContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
                {alerts.map((alert) => {
                    const style = toneStyles[alert.tone];
                    const Icon = style.icon;

                    return (
                        <div
                            key={alert.id}
                            role="alert"
                            aria-live="polite"
                            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur dark:shadow-black/30 ${style.ring}`}
                        >
                            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-5">{style.title}</p>
                                <p className="mt-0.5 text-sm leading-5 opacity-90">{alert.message}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => dismiss(alert.id)}
                                className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                                aria-label="Dismiss alert"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </AlertContext.Provider>
    );
}

export function useAppAlert() {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error('useAppAlert must be used within AppAlertsProvider');
    }

    return context;
}
