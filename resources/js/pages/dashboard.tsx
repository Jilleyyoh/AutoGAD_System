import { type SharedData } from '@/types';
import { useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    // Coerce to number (could arrive as string) & derive role name (normalized)
    const roleId = useMemo(() => {
        const raw = (auth.user as any)?.role_id;
        const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
        return Number.isFinite(n) ? n : undefined;
    }, [auth.user]);

    const roleNameNorm = auth.user?.role?.name
        ? auth.user.role.name.toLowerCase().replace(/\s+/g, '')
        : undefined; // e.g. "Admin 1" -> "admin1"

    useEffect(() => {
        if (!auth?.user) return;

        // Prefer explicit ID mapping (back-end middleware still numeric), but fall back to normalized name
        switch (roleId) {
            case 3: // Admin 1
                router.visit('/admin1/dashboard');
                return;
            case 4: // Admin 2
                router.visit('/admin2/dashboard');
                return;
            case 1: // Proponent
                router.visit('/proponent/dashboard');
                return;
        }

        if (roleNameNorm) {
            if (roleNameNorm === 'admin1') {
                router.visit('/admin1/dashboard');
                return;
            }
            if (roleNameNorm === 'admin2') {
                router.visit('/admin2/dashboard');
                return;
            }
            if (roleNameNorm === 'proponent') {
                router.visit('/proponent/dashboard');
                return;
            }
        }

        // If we get here the assignment is unknown; log detailed diagnostics
        console.error('Unknown user role mapping', {
            receivedRoleId: roleId,
            receivedRoleName: auth.user?.role?.name,
            user: auth.user
        });
    }, [roleId, roleNameNorm, auth?.user]);

    // Graceful minimal fallback UI (rare path)
    if (!roleId && !roleNameNorm) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-xl font-semibold text-gray-800 mb-2">Loading your dashboard...</h1>
                <p className="text-sm text-gray-500">Verifying your role assignment. If this persists, please contact support.</p>
            </div>
        );
    }

    // While redirecting
    return (
        <div className="min-h-screen flex items-center justify-center text-gray-600 text-sm">Redirecting...</div>
    );
}
