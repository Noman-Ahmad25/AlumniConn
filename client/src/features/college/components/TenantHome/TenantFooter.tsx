import { useTenant } from "../../../../providers/TenantProvider";

export default function TenantFooter() {
    const { tenant } = useTenant();
    if (!tenant) return null;

    const socialLinks = tenant.branding?.social_links;

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                <div className="space-y-2 text-center md:text-left">
                    <div className="font-bold text-white text-base">{tenant.name}</div>
                    <div>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#statistics" className="hover:text-white transition-colors">Statistics</a>
                    </div>

                    {socialLinks && Object.keys(socialLinks).length > 0 && (
                        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-700 pt-4 sm:pt-0 sm:pl-6">
                            {Object.entries(socialLinks).map(([platform, url]) => (
                                typeof url === "string" && url.trim() !== "" ? (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="capitalize text-slate-400 hover:text-white transition-colors text-xs font-semibold"
                                    >
                                        {platform}
                                    </a>
                                ) : null
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center md:text-right text-xs text-slate-500">
                    <span>Powered by </span>
                    <span className="font-bold text-slate-300">AlumniConn</span>
                </div>
            </div>
        </footer>
    );
}

