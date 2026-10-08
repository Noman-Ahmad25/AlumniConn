import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../../../providers/TenantProvider";
import DemoEmailInbox from "../components/DemoEmailInbox";

export default function VerifyEmailPending() {
    const navigate = useNavigate();
    const location = useLocation();
    const { tenant } = useTenant();
    const state = location.state as { requestedRole?: string; email?: string } | null;
    const isAlumniRequested = state?.requestedRole === "alumni";
    const userEmail = state?.email;

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

                {isAlumniRequested && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 text-left leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                            <svg className="h-4 w-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Alumni Verification Process
                        </div>
                        You have been registered with Student status first. An alumni verification request has been automatically submitted to your college administrator, who will review and verify your account before granting the Alumni role.
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={() => navigate(`/c/${tenant?.slug}/login`)}
                    >
                        Return to Login
                    </button>
                </div>
            </div>
            <DemoEmailInbox filterEmail={userEmail} className="w-full max-w-lg mt-4" />
        </div>
    );
}
