import { useTenant } from "../../../../providers/TenantProvider";

export default function QuickStatsSection() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    const statsData = tenant.stats;
    const alumniCount = statsData?.alumni_count ?? 0;
    const studentCount = statsData?.student_count ?? 0;
    const connectionCount = statsData?.connection_count ?? 0;
    const majorsCount = statsData?.majors_count ?? 0;

    const formatNumber = (num: number) => num.toLocaleString();

    const stats = [
        { id: "alumni", value: formatNumber(alumniCount), label: "Verified Alumni" },
        { id: "students", value: formatNumber(studentCount), label: "Active Students" },
        { id: "connections", value: formatNumber(connectionCount), label: "Network Connections" },
        { id: "majors", value: formatNumber(majorsCount), label: "Academic Majors" }
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

