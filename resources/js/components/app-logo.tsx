export default function AppLogo() {
    return (
        <>
            <img
                src="/logo.svg"
                alt="Logo"
                className="h-12 w-12 shrink-0 object-contain"
            />
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 mt-1.5 truncate leading-tight font-semibold">GIKMS</span>
            </div>
        </>
    );
}
