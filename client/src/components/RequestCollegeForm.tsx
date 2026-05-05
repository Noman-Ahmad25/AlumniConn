import { useState, type ChangeEvent, type FormEvent } from "react"
import { collegeRequestsAPI } from "../api/requests"
import { getApiErrorMessage } from "../utils/error"

interface RequestCollegeFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function RequestCollegeForm({ onSuccess, onError }: RequestCollegeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    collegeName: "",
    domain: "",
    location: "",
    establishedYear: "",
    description: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPasswordConfirm: "",
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate passwords
    if (formData.adminPassword.length < 8) {
      setError("Admin password must be at least 8 characters")
      return
    }

    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      setError("Admin passwords do not match")
      return
    }

    setLoading(true)

    try {
      await collegeRequestsAPI.requestCollege({
        collegeName: formData.collegeName.trim(),
        domain: formData.domain.trim().toLowerCase(),
        location: formData.location.trim(),
        establishedYear: Number(formData.establishedYear),
        description: formData.description.trim() || undefined,
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPassword: formData.adminPassword,
      })

      setSuccess(true)
      setFormData({
        collegeName: "",
        domain: "",
        location: "",
        establishedYear: "",
        description: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminPasswordConfirm: "",
      })

      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err, "Failed to submit college request")
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="surface-card mx-auto max-w-2xl p-6">
      <h2 className="text-2xl font-bold mb-6">Request College Onboarding</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-semibold">College request submitted successfully!</p>
          <p className="text-sm mt-1">Awaiting SUPER_ADMIN approval. Once approved, the college and admin account will be activated immediately.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Name *
          </label>
          <input
            type="text"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="e.g., Greenfield Institute of Technology"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Name *
          </label>
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="e.g., Priya Sharma"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Domain *
          </label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="college.edu"
          />
          <p className="text-xs text-gray-500 mt-1">The admin email must use this domain.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="e.g., Bengaluru, India"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Established Year *
          </label>
          <input
            type="number"
            name="establishedYear"
            value={formData.establishedYear}
            onChange={handleChange}
            required
            min="1000"
            max="9999"
            className="form-field"
            placeholder="e.g., 1998"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Email *
          </label>
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="admin@college.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Password *
          </label>
          <input
            type="password"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="At least 8 characters"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            name="adminPasswordConfirm"
            value={formData.adminPasswordConfirm}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="Re-enter password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-field"
            rows={3}
            placeholder="Optional short description of the college"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Submitting..." : "Submit College Request"}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <p className="font-semibold mb-1">What happens next:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>A SUPER_ADMIN will review your college request</li>
          <li>If approved, the college is activated immediately</li>
          <li>The admin account is created with the password you provided</li>
          <li>Admin can login right away using the email and password</li>
          <li>Recommend changing the password after first login for security</li>
        </ul>
      </div>
    </div>
  )
}
