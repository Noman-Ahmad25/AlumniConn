import { useState, useEffect } from "react"
import { useTenant } from "../../../providers/TenantProvider"
import { updateCollege, type CollegeUpdateRequest } from "../../college/api/college"
import { getApiErrorMessage } from "../../../utils/error"
import { getContrastColor } from "../../college/utils/branding"

export default function CollegeAdminBranding() {
  const { tenant, refreshTenant } = useTenant()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    banner_url: "",
    primary_color: "#2563eb",
    secondary_color: "#6c757d",
    accent_color: "#0056b3",
    welcome_message: "",
    motto: "",
  })

  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        description: tenant.description || "",
        logo_url: tenant.branding?.logo_url || "",
        banner_url: tenant.branding?.banner_url || "",
        primary_color: tenant.branding?.primary_color || "#2563eb",
        secondary_color: tenant.branding?.secondary_color || "#6c757d",
        accent_color: tenant.branding?.accent_color || "#0056b3",
        welcome_message: tenant.branding?.welcome_message || "",
        motto: tenant.branding?.motto || "",
      })
    }
  }, [tenant])

  if (!tenant) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-medium">
        Loading college details...
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const payload: CollegeUpdateRequest = {
        name: formData.name.trim() || undefined,
        description: formData.description.trim() || undefined,
        branding: {
          logo_url: formData.logo_url.trim() || null,
          banner_url: formData.banner_url.trim() || null,
          primary_color: formData.primary_color.trim() || null,
          secondary_color: formData.secondary_color.trim() || null,
          accent_color: formData.accent_color.trim() || null,
          welcome_message: formData.welcome_message.trim() || null,
          motto: formData.motto.trim() || null,
        },
      }

      await updateCollege(tenant.id, payload)
      if (refreshTenant) {
        await refreshTenant()
      }

      setSuccessMsg("College branding updated successfully.")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Failed to update college branding."))
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        description: tenant.description || "",
        logo_url: tenant.branding?.logo_url || "",
        banner_url: tenant.branding?.banner_url || "",
        primary_color: tenant.branding?.primary_color || "#2563eb",
        secondary_color: tenant.branding?.secondary_color || "#6c757d",
        accent_color: tenant.branding?.accent_color || "#0056b3",
        welcome_message: tenant.branding?.welcome_message || "",
        motto: tenant.branding?.motto || "",
      })
      setErrorMsg("")
      setSuccessMsg("")
    }
  }

  const previewTextColor = getContrastColor(formData.primary_color)

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Campus Branding & Identity</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize {tenant.name}&apos;s institutional appearance, logos, and color palette.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between shadow-sm">
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between shadow-sm">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-rose-600 hover:text-rose-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Branding Preview Card */}
      <div className="surface-card p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Appearance Preview</h2>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              {formData.logo_url ? (
                <img
                  src={formData.logo_url}
                  alt="Logo Preview"
                  className="h-8 w-8 object-contain rounded-md"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    ;(e.target as HTMLElement).style.display = "none"
                  }}
                />
              ) : (
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.accent_color})`,
                    color: previewTextColor,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
                    <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11" />
                    <path d="M21 8.5v5" />
                  </svg>
                </span>
              )}
              <span className="font-bold text-slate-900 text-base">{formData.name || "College Name"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: `${formData.primary_color}18`,
                  color: formData.primary_color,
                }}
              >
                Active Tab
              </span>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all"
                style={{
                  backgroundColor: formData.primary_color,
                  color: previewTextColor,
                }}
              >
                Primary Button
              </button>
            </div>
          </div>

          {formData.motto && (
            <p className="text-xs text-slate-500 italic">
              &ldquo;{formData.motto}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="surface-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institutional Info */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="field-label">
              College Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-field"
              placeholder="e.g. Northbridge Institute of Technology"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="field-label">
              Campus Overview / Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="form-field"
              placeholder="Brief summary of the institution, campus history, or alumni mission."
            />
          </div>

          {/* Media Links */}
          <div>
            <label htmlFor="logo_url" className="field-label">
              Logo URL
            </label>
            <input
              id="logo_url"
              name="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={handleChange}
              className="form-field"
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-slate-400">Direct image link for topbar and login header.</p>
          </div>

          <div>
            <label htmlFor="banner_url" className="field-label">
              Banner / Cover URL
            </label>
            <input
              id="banner_url"
              name="banner_url"
              type="url"
              value={formData.banner_url}
              onChange={handleChange}
              className="form-field"
              placeholder="https://example.com/banner.jpg"
            />
            <p className="mt-1 text-xs text-slate-400">Hero background banner for public campus home.</p>
          </div>

          {/* Theme Colors */}
          <div>
            <label htmlFor="primary_color" className="field-label">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primary_color_picker"
                aria-label="Primary Brand Color picker"
                value={formData.primary_color.startsWith("#") ? formData.primary_color : "#2563eb"}
                onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                className="h-10 w-12 cursor-pointer rounded border border-slate-200 p-0.5 bg-white"
              />
              <input
                id="primary_color"
                name="primary_color"
                type="text"
                value={formData.primary_color}
                onChange={handleChange}
                className="form-field flex-1 font-mono uppercase"
                placeholder="#2563EB"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Applied to buttons, active navigation, and brand marks.</p>
          </div>

          <div>
            <label htmlFor="accent_color" className="field-label">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="accent_color_picker"
                aria-label="Accent Color picker"
                value={formData.accent_color.startsWith("#") ? formData.accent_color : "#0056b3"}
                onChange={(e) => setFormData((prev) => ({ ...prev, accent_color: e.target.value }))}
                className="h-10 w-12 cursor-pointer rounded border border-slate-200 p-0.5 bg-white"
              />
              <input
                id="accent_color"
                name="accent_color"
                type="text"
                value={formData.accent_color}
                onChange={handleChange}
                className="form-field flex-1 font-mono uppercase"
                placeholder="#0056B3"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Secondary brand gradients and decorative accents.</p>
          </div>

          {/* Messaging */}
          <div>
            <label htmlFor="welcome_message" className="field-label">
              Welcome Headline
            </label>
            <input
              id="welcome_message"
              name="welcome_message"
              type="text"
              value={formData.welcome_message}
              onChange={handleChange}
              className="form-field"
              placeholder="e.g. Welcome to the Northbridge Alumni Network"
            />
          </div>

          <div>
            <label htmlFor="motto" className="field-label">
              Institutional Motto
            </label>
            <input
              id="motto"
              name="motto"
              type="text"
              value={formData.motto}
              onChange={handleChange}
              className="form-field"
              placeholder="e.g. Excellence in Education and Research"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="btn btn-secondary px-4 text-xs"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-5 text-xs shadow-sm"
          >
            {saving ? "Saving..." : "Save Branding Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
