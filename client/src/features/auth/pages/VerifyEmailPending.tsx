import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../providers/TenantProvider";

export default function VerifyEmailPending() {
    const navigate = useNavigate();
    const { tenant } = useTenant();

    return (
        <div className="auth-shell">
            <div className="auth-card px-7 py-7 space-y-5 text-center">
                {tenant?.branding?.logo_url ? (
                    <img src={tenant.branding.logo_url} alt={`${tenant.name} Logo`} className="mx-auto h-12 w-auto mb-4" />
                ) : (
                    <div className="brand-mark mx-auto mb-4" aria-hidden="true">
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                            <polyline points="3 7 12 13 21 7"></polyline>
                        </svg>
                    </div>
                )}
                <h1 className="text-2xl font-bold text-slate-950">Check your email</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    We've sent a verification link to your email address. Please click the link to verify your account and continue.
                </p>

                <div className="pt-4">
                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={() => navigate(`/c/${tenant?.slug}/login`)}
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
