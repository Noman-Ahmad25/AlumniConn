import { useTenant } from "../../../../providers/TenantProvider";

export default function QuickStatsSection() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    // Placements/metrics data mapping
    const stats = [
        { id: "alumni", value: "10,000+", label: "Verified Alumni" },
        { id: "students", value: "4,500+", label: "Active Students" },
        { id: "connections", value: "25,000+", label: "Network Connections" },
        { id: "events", value: "500+", label: "Events & Workshops" }
    ];

    return (
        <section id="statistics" className="bg-slate-50 border-y border-slate-200/80 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
                    {stats.map((stat) => (
                        <div key={stat.id} className="space-y-2">
                            <div className="text-3xl font-extrabold text-[var(--primary)] md:text-4xl">
                                {stat.value}
                            </div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
