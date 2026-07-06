import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/auth'
import { getColleges, type College } from "../../college/api/college"
import { getApiErrorMessage } from "../../../utils/error"
import { setAuthToken } from '../utils/auth'

interface RegisterForm {
    username: string
    email: string
    password: string
    college_id: string
}


export default function Register(){
    const navigate = useNavigate()

    const [colleges, setColleges] = useState<College[]>([])
    const [form, setForm] = useState<RegisterForm>({
        username: '',
        email: '',
        password: '',
        college_id: ''
    })

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await getColleges()
                setColleges(response)
            } catch (error) {
                console.error('Error fetching colleges:', error)
            }
        }

        fetchColleges()
    }, [])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...form,
                college_id: Number(form.college_id),
                role: "student" as const
            }

            await registerUser(payload)
            const response = await loginUser({
                email: form.email,
                password: form.password,
                college_id: Number(form.college_id)
            })

            setAuthToken(response.access_token)
            navigate('/create-profile')
        }
        catch (error: unknown) {
            console.error('Error during registration:', error)
            alert(getApiErrorMessage(error, 'Registration failed'))
        }
        finally {
            setLoading(false)
        }
    }
return (
    <div className="auth-shell">
      <div className="auth-card">
          <div className="px-7 py-8 text-center">
            <div className="brand-mark mx-auto mb-4" aria-hidden="true">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                <path d="M21 8.5v5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-950">Join AluminiConn</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Connect with alumni and classmates from your college.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 px-7 py-6 space-y-5"
          >
            <div>
              <label className="field-label">Username</label>
              <input
                type="text"
                name="username"
                placeholder="john_doe"
                value={form.username}
                onChange={handleChange}
                className="form-field"
                required
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className="form-field"
                required
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="8+ characters"
                value={form.password}
                onChange={handleChange}
                className="form-field"
                required
              />
            </div>

            <div>
              <label className="field-label">College</label>
              <select
                name="college_id"
                value={form.college_id}
                onChange={handleChange}
                className="form-field"
                required
              >
                <option value="">Select your college</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn w-full ${
                loading
                  ? "btn-secondary"
                  : "btn-primary"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 bg-slate-50 px-7 py-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-blue-700 transition-colors hover:text-blue-800"
            >
              Sign in
            </button>
            <div className="mt-3">
              <button
                onClick={() => navigate("/request-college")}
                className="font-bold text-blue-700 transition-colors hover:text-blue-800"
              >
                Request college onboarding
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}
