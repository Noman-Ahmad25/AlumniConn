import { useEffect } from "react";
import { useTenant } from "../../../providers/TenantProvider";
import { getContrastColor, updateFavicon, updateMetaTags } from "../utils/branding";

// Section imports
import TenantNavbar from "../components/TenantHome/TenantNavbar";
import HeroSection from "../components/TenantHome/HeroSection";
import QuickStatsSection from "../components/TenantHome/QuickStatsSection";
import AboutSection from "../components/TenantHome/AboutSection";
import FeaturesSection from "../components/TenantHome/FeaturesSection";
import TestimonialsSection from "../components/TenantHome/TestimonialsSection";
import CTASection from "../components/TenantHome/CTASection";
import TenantFooter from "../components/TenantHome/TenantFooter";

// Extensible registry configuration of sections
const SECTIONS_REGISTRY = [
    { id: "hero", Component: HeroSection },
    { id: "stats", Component: QuickStatsSection },
    { id: "about", Component: AboutSection },
    { id: "features", Component: FeaturesSection },
    { id: "testimonials", Component: TestimonialsSection },
    { id: "cta", Component: CTASection }
];

export default function TenantHome() {
    const { tenant } = useTenant();

    useEffect(() => {
        if (!tenant) return;

        // 1. Dynamic document metadata injection (SEO & White-labeling)
        const welcomeMessage = tenant.branding?.welcome_message;
        updateMetaTags(
            tenant.name, 
            welcomeMessage || `Join the private alumni portal of ${tenant.name}.`
        );

        // 2. Favicon dynamically matching university logo
        updateFavicon(tenant.branding?.logo_url);

        // 3. Programmatic WCAG contrast check & injection
        if (tenant.branding) {
            const root = document.documentElement;
            const primaryTextContrast = getContrastColor(tenant.branding.primary_color);
            const accentTextContrast = getContrastColor(tenant.branding.accent_color);

            root.style.setProperty("--text-on-primary", primaryTextContrast);
            root.style.setProperty("--text-on-accent", accentTextContrast);
        }
    }, [tenant]);

    if (!tenant) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600 font-semibold">
                Loading campus context...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased selection:bg-[var(--primary)] selection:text-[var(--text-on-primary)]">
            <TenantNavbar />
            
            <main className="flex-1">
                {SECTIONS_REGISTRY.map(({ id, Component }) => (
                    <Component key={id} />
                ))}
            </main>

            <TenantFooter />
        </div>
    );
}
