import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status, temporary_password }: { status?: string; temporary_password?: string }) {
    const { flash } = usePage().props as {
        flash?: {
            status?: string;
            temporary_password?: string;
        };
    };
    const successStatus = status ?? flash?.status;
    const successPassword = temporary_password ?? flash?.temporary_password;

    return (
        <AuthLayout title="Reset password" description="Enter your email and birthdate to reset your password">
            <Head title="Forgot password">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="space-y-6">
                <Form {...store.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                    className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-visible:border-purple-500 focus-visible:ring-purple-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birthdate" className="text-white">
                                    Date of birth
                                </Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    name="birthdate"
                                    autoComplete="off"
                                    placeholder="YYYY-MM-DD"
                                    className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus-visible:border-purple-500 focus-visible:ring-purple-500"
                                />
                                <InputError message={errors.birthdate} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <button
                                    className="w-full px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white rounded-lg font-semibold transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Reset password
                                </button>
                            </div>

                            {successStatus && (
                                <div className="mt-2 rounded-lg border border-green-400 bg-green-50 p-4 text-sm text-green-800">
                                    <p className="font-semibold">
                                        ✓ Password Reset Successful
                                    </p>
                                    <p className="mt-2">
                                        {successStatus}
                                    </p>
                                    {successPassword && (
                                        <div className="mt-3 rounded-md bg-white px-3 py-2 font-mono text-base tracking-wider text-gray-900">
                                            {successPassword}
                                        </div>
                                    )}
                                </div>
                            )}

                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-gray-700 dark:text-gray-300">
                    <span>Return to</span>
                    <TextLink href={login()} className="text-gray-900 hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-300">
                        log in
                    </TextLink>
                </div>

            </div>
        </AuthLayout>
    );
}
