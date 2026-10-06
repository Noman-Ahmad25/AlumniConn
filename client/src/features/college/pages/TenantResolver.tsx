import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { getCollegeBySlug, type CollegePublicResponse } from "../../college/api/college";
import { TenantProvider } from "../../../providers/TenantProvider";
import NotFound from "../../../shared/pages/NotFound";
import Topbar from "../../../layouts/AppShell/Topbar";
import Footer from "../../../layouts/AppShell/Footer";

export default function TenantResolver() {
    const { collegeSlug } = useParams<{ collegeSlug: string }>();
    const location = useLocation();
    const [tenant, setTenant] = useState<CollegePublicResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!collegeSlug) {
            setError(true);
            setLoading(false);
            return;
        }

        const fetchTenant = async () => {
            try {
                const data = await getCollegeBySlug(collegeSlug);
                setTenant(data);
                
                // Inject Branding variables
                if (data.branding) {
                    const root = document.documentElement;
                    if (data.branding.primary_color) {
                        root.style.setProperty('--primary', data.branding.primary_color);
                    }
                    if (data.branding.accent_color) {
                        root.style.setProperty('--accent', data.branding.accent_color);
                    }
                }
            } catch (err) {
                console.error("Failed to load tenant", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [collegeSlug]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Campus Network...</div>;
    }

    if (error || !tenant) {
        return <NotFound message={`Campus network for '${collegeSlug}' not found.`} />;
    }

    const isLandingPage = location.pathname === `/c/${collegeSlug}` || location.pathname === `/c/${collegeSlug}/`;

    if (isLandingPage) {
        return (
            <TenantProvider tenant={tenant}>
                <Outlet />
            </TenantProvider>
        );
    }

    return (
        <TenantProvider tenant={tenant}>
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

