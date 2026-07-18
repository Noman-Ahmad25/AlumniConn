import { useTenant } from "../../../../providers/TenantProvider";

export default function AboutSection() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    const establishedYear = tenant.established_year;
    const location = tenant.location;
    const description = tenant.description || "Connecting past and present students for a lifetime of collaboration and growth.";

    return (
        <section id="about" className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                        About Our Network
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Unlocking the Power of the {tenant.name} Community
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        {description}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        Our private alumni portal serves as a secure bridge for networking, guidance, and career growth. By uniting students and graduates across different departments and generations, we cultivate opportunity and sustain institutional excellence.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 p-6 shadow-sm bg-slate-50">
                        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Established</div>
                        <div className="text-3xl font-extrabold text-slate-800">
                            {establishedYear || "N/A"}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                            Fostering academic excellence and connection.
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-6 shadow-sm bg-slate-50">
                        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Campus Location</div>
                        <div className="text-3xl font-extrabold text-slate-800 truncate" title={location || "Global"}>
                            {location || "Global"}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                            The heart of our student community.
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-6 shadow-sm bg-slate-50 sm:col-span-2">
                        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Why Join Us?</div>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Gain exclusive access to placement drives, career portals, and jobs.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Get matched with student mentors or alumni advisors in your industry.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
