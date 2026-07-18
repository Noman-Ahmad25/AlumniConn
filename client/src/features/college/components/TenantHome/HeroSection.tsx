import { Link } from "react-router-dom";
import { useTenant } from "../../../../providers/TenantProvider";

export default function HeroSection() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    const bannerUrl = tenant.branding?.banner_url;
    const logoUrl = tenant.branding?.logo_url;
    const welcomeMessage = tenant.branding?.welcome_message || `Welcome to the ${tenant.name} Alumni Network`;

    const handleLearnMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById("about");
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section 
            className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-900 px-6 py-20 text-center"
            style={{
                backgroundImage: bannerUrl ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${bannerUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* If there is no custom banner, show a premium dynamic CSS gradient */}
            {!bannerUrl && (
                <div 
                    className="absolute inset-0 -z-10 opacity-40 mix-blend-multiply"
                    style={{
                        background: `radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 70%), 
                                     radial-gradient(circle at 80% 70%, var(--accent) 0%, transparent 70%)`
                    }}
                />
            )}

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
                {/* Logo container */}
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl border border-slate-100/50">
                    {logoUrl ? (
                        <img 
                            src={logoUrl} 
                            alt={`${tenant.name} Logo`} 
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = document.getElementById("hero-fallback-icon");
                                if (fallback) fallback.style.display = "flex";
                            }}
                        />
                    ) : null}
                    <div 
                        id="hero-fallback-icon"
                        className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--text-on-primary)]"
                        style={{ display: logoUrl ? "none" : "flex" }}
                    >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                            <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                            <path d="M21 8.5v5" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-3xl leading-tight">
                        {welcomeMessage}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl leading-relaxed">
                        Connect with fellow graduates, explore job opportunities, find mentors, and stay updated with your alma mater.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link
                        to={`/c/${tenant.slug}/register`}
                        className="btn w-full sm:w-auto rounded-lg px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all border-none bg-[var(--primary)] text-[var(--text-on-primary)] hover:brightness-95"
                    >
                        Join Your Network
                    </Link>
                    <Link
                        to={`/c/${tenant.slug}/login`}
                        className="btn w-full sm:w-auto rounded-lg px-8 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all border border-slate-300/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="pt-8">
                    <a
                        href="#about"
                        onClick={handleLearnMore}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        <span>Learn More</span>
                        <svg className="animate-bounce" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
