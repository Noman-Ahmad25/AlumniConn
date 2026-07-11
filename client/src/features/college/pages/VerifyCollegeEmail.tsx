import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collegeRequestsAPI } from "../../admin/api/requests";
import { getApiErrorMessage } from "../../../utils/error";

export default function VerifyCollegeEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            if (!token) {
                if (isMounted) {
                    setError("Missing verification token. Please check your email link.");
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await collegeRequestsAPI.verifyEmail(token);
                if (isMounted) {
                    setMessage(response.message || "Email verified successfully! A Super Admin will review your request.");
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
    }, [token]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950">College Request Verification</h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-sm text-slate-500">Verifying your email...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
                        )}

                        {message && (
                            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary w-full"
                            onClick={() => navigate("/")}
                        >
                            Return to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
