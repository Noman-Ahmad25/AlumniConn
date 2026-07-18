import { useTenant } from "../../../../providers/TenantProvider";

export default function TenantFooter() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                <div className="space-y-2 text-center md:text-left">
                    <div className="font-bold text-white text-base">{tenant.name}</div>
                    <div>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                </div>

                <div className="text-center md:text-right text-xs text-slate-500">
                    <span>Powered by </span>
                    <span className="font-bold text-slate-300">AlumniConn</span>
                </div>
            </div>
        </footer>
    );
}
