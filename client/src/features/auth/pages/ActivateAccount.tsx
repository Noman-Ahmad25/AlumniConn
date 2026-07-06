import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { activateAccount, verifyActivationToken } from "../api/auth"
import { getApiErrorMessage } from "../../../utils/error"

export default function ActivateAccount() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activatedEmail, setActivatedEmail] = useState("")

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Activation token is missing")
        setChecking(false)
        return
      }

      try {
        const response = await verifyActivationToken(token)
        setIsValidToken(response.valid)
        if (!response.valid) setError(response.detail)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Unable to verify activation link"))
      } finally {
        setChecking(false)
      }
    }

    checkToken()
  }, [token])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setSubmitting(true)
    try {
      const user = await activateAccount({ token, password })
      setActivatedEmail(user.email)
      setMessage("Your admin account is active. You can now sign in.")
      setIsValidToken(false)
      setPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to activate account"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card px-7 py-7">
        <div className="text-center">
          <div className="brand-mark mx-auto mb-4" aria-hidden="true">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
              <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
              <path d="M21 8.5v5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Activate admin account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Set a password to finish secure onboarding.</p>
        </div>

        {checking ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="spinner" />
            <p className="text-sm font-medium text-slate-500">Checking activation link...</p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{error}</p>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                <p>{message}</p>
                {activatedEmail && <p className="mt-1 text-emerald-600">{activatedEmail}</p>}
              </div>
            )}

            {isValidToken && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label>
                  <span className="field-label">New password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="form-field"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label>
                  <span className="field-label">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="form-field"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                  {submitting ? "Activating..." : "Activate account"}
                </button>
              </form>
            )}

            {!isValidToken && (
              <button type="button" onClick={() => navigate("/login")} className="btn btn-primary w-full">
                Go to login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
