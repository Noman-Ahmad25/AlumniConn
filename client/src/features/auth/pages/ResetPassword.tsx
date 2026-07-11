import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { getApiErrorMessage } from "../../../utils/error";
import { useTenant } from "../../../providers/TenantProvider";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!tenant) {
            setError("Invalid tenant");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Missing reset token. Please request a new password reset link.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await resetPassword({
                token,
                new_password: password
            });
            setMessage(response.message || "Password successfully reset.");
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Failed to reset password. The link may have expired."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <form onSubmit={handleSubmit} className="auth-card px-7 py-7 space-y-5">
                <div className="text-center">
                    {tenant?.branding?.logo_url ? (
                        <img src={tenant.branding.logo_url} alt={`${tenant.name} Logo`} className="mx-auto h-12 w-auto mb-4" />
                    ) : (
                        <div className="brand-mark mx-auto mb-4" aria-hidden="true">
                            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-slate-950">Reset Password</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Create a new, strong password.</p>
                </div>

                {error && (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
                )}

                {message ? (
                    <div className="space-y-4 text-center">
                        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>
                        <button
                            type="button"
                            className="btn btn-primary w-full"
                            onClick={() => navigate(`/c/${tenant?.slug}/login`)}
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <label>
                            <span className="field-label">New Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-field"
                                required
                            />
                        </label>
                        
                        <label>
                            <span className="field-label">Confirm Password</span>
                            <input
                                type="password"
                                name="confirm_password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-field"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword || !token}
                            className="btn btn-primary w-full"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
