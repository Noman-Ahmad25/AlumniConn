import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { getCollegeBySlug, type CollegePublicResponse } from "../../college/api/college";
import { TenantProvider } from "../../../providers/TenantProvider";
import { getContrastColor, updateFavicon, updateMetaTags } from "../utils/branding";
import NotFound from "../../../shared/pages/NotFound";
import Topbar from "../../../layouts/AppShell/Topbar";
import Footer from "../../../layouts/AppShell/Footer";

function applyBranding(tenant: CollegePublicResponse) {
    const root = document.documentElement;
    const primaryColor = tenant.branding?.primary_color || "#2563eb";
    const accentColor = tenant.branding?.accent_color || "#0f766e";
    const primaryTextContrast = getContrastColor(primaryColor);
    const accentTextContrast = getContrastColor(accentColor);

    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--text-on-primary", primaryTextContrast);
    root.style.setProperty("--text-on-accent", accentTextContrast);

    if (tenant.branding?.logo_url) {
        updateFavicon(tenant.branding.logo_url);
    }
    updateMetaTags(`${tenant.name} | AlumniConn`, tenant.description);
}

function resetBranding() {
    const root = document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--text-on-primary");
    root.style.removeProperty("--text-on-accent");
    updateFavicon("/favicon.svg");
    document.title = "AlumniConn";
}

export default function TenantResolver() {
    const { collegeSlug } = useParams<{ collegeSlug: string }>();
    const location = useLocation();
    const [tenant, setTenant] = useState<CollegePublicResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchTenant = useCallback(async () => {
        if (!collegeSlug) return;
        try {
            const data = await getCollegeBySlug(collegeSlug);
            setTenant(data);
            applyBranding(data);
        } catch (err) {
            console.error("Failed to load tenant", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [collegeSlug]);

    useEffect(() => {
        if (!collegeSlug) {
            setError(true);
            setLoading(false);
            return;
        }

        fetchTenant();

        return () => {
            resetBranding();
        };
    }, [collegeSlug, fetchTenant]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Campus Network...</div>;
    }

    if (error || !tenant) {
        return <NotFound message={`Campus network for '${collegeSlug}' not found.`} />;
    }

    const isLandingPage = location.pathname === `/c/${collegeSlug}` || location.pathname === `/c/${collegeSlug}/`;

    if (isLandingPage) {
        return (
            <TenantProvider tenant={tenant} refreshTenant={fetchTenant}>
                <Outlet />
            </TenantProvider>
        );
    }

    return (
        <TenantProvider tenant={tenant} refreshTenant={fetchTenant}>
            <div className="flex min-h-screen flex-col bg-slate-50">
                <Topbar />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </TenantProvider>
    );
}

