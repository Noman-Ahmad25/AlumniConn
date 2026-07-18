import { Link } from "react-router-dom";
import { useTenant } from "../../../../providers/TenantProvider";

export default function CTASection() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    return (
        <section className="py-20 px-6 bg-[var(--primary)] text-[var(--text-on-primary)] relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 -z-10 bg-slate-950/10" />
            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/5" />
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/5" />

            <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl leading-tight">
                    Join Your {tenant.name} Alumni Community Today
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-[var(--text-on-primary)]/80 leading-relaxed">
                    Reconnect with classmates, access exclusive professional networks, and help guide the next generation of students.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link
                        to={`/c/${tenant.slug}/register`}
                        className="btn w-full sm:w-auto rounded-lg px-8 py-4 text-base font-bold bg-white text-[var(--primary)] hover:bg-slate-50 shadow-md hover:shadow-lg transition-all border-none"
                    >
                        Sign Up Now
                    </Link>
                    <Link
                        to={`/c/${tenant.slug}/login`}
                        className="btn w-full sm:w-auto rounded-lg px-8 py-4 text-base font-bold border border-white/40 bg-white/10 text-[var(--text-on-primary)] hover:bg-white/20 backdrop-blur-sm shadow-sm"
                    >
                        Access Portal
                    </Link>
                </div>
            </div>
        </section>
    );
}
