import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { useEffect } from 'react';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/build/finisher-header.es5.min.js';
        script.onload = () => {
            new (window as any).FinisherHeader({
                  "count": 15,
                    "size": {
                      "min": 1100,
                      "max": 1800,
                      "pulse": 0.5    
                },
                "speed": {
                    "x": {
                        "min": 0.6,
                        "max": 1.2
                    },
                    "y": {
                        "min": 0.6,
                        "max": 1.2
                    }
                },
                "colors": {
                    "background": "#300B63",
                    "particles": [
                        "#300b63",
                        "#4b0082",
                        "#800080",
                        "#9932cc",
                        "#6015c9"
                    ]
                },
                "blending": "overlay",
                "opacity": {
                    "center": 0.6,
                    "edge": 0.08
                },
                "skew": 0,
                "className": "finisher-header",
                "shapes": [
                    "c"
                ]
            });
        };
        document.head.appendChild(script);
    }, []);

    return (
        <div className="min-h-screen bg-[#300B63] text-white flex flex-col relative z-10 finisher-header">
            <AuthLayoutTemplate title={title} description={description} {...props}>
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
