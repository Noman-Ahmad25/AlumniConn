import { Link } from "react-router-dom";
import { useTenant } from "../../../../providers/TenantProvider";

export default function TenantNavbar() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    const brandName = tenant.name;
    const logoUrl = tenant.branding?.logo_url;

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 opacity-95 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-3">
                {logoUrl ? (
                    <img 
                        src={logoUrl} 
                        alt={`${brandName} Logo`} 
                        className="h-9 w-9 rounded-md object-contain"
                        onError={(e) => {
                            // Fallback if logo fails to load
                            e.currentTarget.style.display = "none";
                            const fallback = document.getElementById("navbar-fallback-icon");
                            if (fallback) fallback.style.display = "flex";
                        }}
                    />
                ) : null}
                <div 
                    id="navbar-fallback-icon"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--text-on-primary)]"
                    style={{ display: logoUrl ? "none" : "flex" }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                        <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                        <path d="M21 8.5v5" />
                    </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">{brandName}</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <a href="#about" className="hover:text-[var(--primary)] transition-colors">About</a>
                <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
                <a href="#statistics" className="hover:text-[var(--primary)] transition-colors">Statistics</a>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                    to={`/c/${tenant.slug}/login`}
                    className="btn btn-secondary text-sm px-4 py-2 min-h-0"
                >
                    Login
                </Link>
                <Link
                    to={`/c/${tenant.slug}/register`}
                    className="btn btn-primary text-sm px-4 py-2 min-h-0 bg-[var(--primary)] text-[var(--text-on-primary)] hover:brightness-95 border-none"
                >
                    Join Network
                </Link>
            </div>
        </header>
    );
}
