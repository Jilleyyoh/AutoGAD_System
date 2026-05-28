import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <div className="relative z-10 flex min-h-screen flex-col bg-background text-foreground">
            <AuthLayoutTemplate title={title} description={description} {...props}>
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
