const ACRONYMS = new Set(['gad', 'pap', 'pdf']);

export function formatLabel(value: unknown, fallback = 'Unknown'): string {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return String(value)
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .map((word) => {
            const lower = word.toLowerCase();

            if (ACRONYMS.has(lower)) {
                return lower.toUpperCase();
            }

            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
}

export function formatStatus(value: unknown): string {
    return formatLabel(value, 'Unknown');
}

export function formatPhase(value: unknown): string {
    return formatLabel(value, 'Not Selected');
}
