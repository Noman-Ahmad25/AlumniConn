import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { getApiErrorMessage } from "../../../utils/error";
import { useTenant } from "../../../providers/TenantProvider";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            if (!tenant) {
                if (isMounted) {
                    setError("Invalid tenant");
                    setLoading(false);
                }
                return;
            }

            if (!token) {
                if (isMounted) {
                    setError("Missing verification token. Please check your email link.");
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await verifyEmail({ token });
                if (isMounted) {
                    setMessage(response.message || "Email verified successfully.");
                    setLoading(false);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(getApiErrorMessage(err, "Failed to verify email. The link may have expired."));
                    setLoading(false);
                }
            }
        };

        verify();

        return () => {
            isMounted = false;
        };
    }, [token, tenant]);

    return (
        <div className="auth-shell">
            <div className="auth-card px-7 py-7 space-y-5">
                <div className="text-center">
                    {tenant?.branding?.logo_url ? (
                        <img src={tenant.branding.logo_url} alt={`${tenant.name} Logo`} className="mx-auto h-12 w-auto mb-4" />
                    ) : (
                        <div className="brand-mark mx-auto mb-4" aria-hidden="true">
                            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-slate-950">Email Verification</h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-sm text-slate-500">Verifying your email...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
                        )}

                        {message && (
                            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">{message}</p>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary w-full"
                            onClick={() => navigate(`/c/${tenant?.slug}/login`)}
                        >
                            Continue to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
