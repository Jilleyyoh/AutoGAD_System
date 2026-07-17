import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password({ mustChangePassword, status }: { mustChangePassword?: boolean; status?: string }) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const passwordChangeNotice =
        status || (mustChangePassword ? 'Please change your temporary password before continuing.' : '');
    const passwordChecks = useMemo(() => {
        const meetsLength = newPassword.length >= 8;
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
        const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

        return [
            { label: 'At least 8 characters', valid: meetsLength },
            { label: 'Contains an uppercase letter', valid: hasUppercase },
            { label: 'Contains a lowercase letter', valid: hasLowercase },
            { label: 'Contains a number', valid: hasNumber },
            { label: 'Contains a symbol', valid: hasSymbol },
            { label: 'Passwords match', valid: passwordsMatch },
        ];
    }, [confirmPassword, newPassword]);
    const passwordIsReady = passwordChecks.every((check) => check.valid);

    const PasswordToggle = ({
        visible,
        onToggle,
        label,
    }: {
        visible: boolean;
        onToggle: () => void;
        label: string;
    }) => (
        <button
            type="button"
            onClick={onToggle}
            aria-label={label}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-white transition hover:text-white focus:outline-none focus-visible:text-white dark:text-white dark:hover:text-white dark:focus-visible:text-white"
        >
            {visible ? <EyeOff className="h-4 w-4 text-white" /> : <Eye className="h-4 w-4 text-white" />}
        </button>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />

                    {passwordChangeNotice && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-50">
                            <p className="font-semibold">Password update required</p>
                            <p className="mt-2">{passwordChangeNotice}</p>
                        </div>
                    )}

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={['password', 'password_confirmation', 'current_password']}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Current password</Label>

                                    <div className="relative mt-1">
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            className="block w-full pr-10"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                        />
                                        <PasswordToggle
                                            visible={showCurrentPassword}
                                            onToggle={() => setShowCurrentPassword((value) => !value)}
                                            label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                        />
                                    </div>

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">New password</Label>

                                    <div className="relative mt-1">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="block w-full pr-10"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                        />
                                        <PasswordToggle
                                            visible={showNewPassword}
                                            onToggle={() => setShowNewPassword((value) => !value)}
                                            label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        />
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">Live password check</p>
                                        <ul className="mt-3 space-y-2">
                                            {passwordChecks.map((check) => (
                                                <li key={check.label} className="flex items-center gap-2">
                                                    {check.valid ? (
                                                        <Check className="h-4 w-4 text-[#690383]" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                                    )}
                                                    <span className={check.valid ? 'text-[#690383]' : 'text-gray-600 dark:text-gray-400'}>
                                                        {check.label}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>

                                    <div className="relative mt-1">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="block w-full pr-10"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                        />
                                        <PasswordToggle
                                            visible={showConfirmPassword}
                                            onToggle={() => setShowConfirmPassword((value) => !value)}
                                            label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                                        />
                                    </div>

                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing || !passwordIsReady || !currentPassword || !confirmPassword}>
                                        Save password
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
