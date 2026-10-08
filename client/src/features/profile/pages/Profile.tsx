import { useEffect, useState, type FormEvent } from "react"
import { useParams } from "react-router-dom"
import { useCollegeNavigation } from "../../../shared/utils/navigation"
import { getMyProfile, getUserProfile, updateProfile } from "../api/profile"
import { getUserPosts } from "../../feed/api/post"
import { startConversation } from "../../messages/api/message"
import PostCard from "../../feed/components/PostCard"
import ConnectionButton from "../../connections/components/ConnectionButton"
import ProfileForm from "../components/ProfileForm"
import RequestAlumniRole from "../../feed/components/RequestAlumniRole"
import { alumniRequestsAPI } from "../../admin/api/requests"
import type { RequestStatus } from "../../admin/types/request"
import {
  formToProfilePayload,
  profileToForm,
  type ProfileFormValues,
} from "../components/profileFormUtils"
import type { Profile as ProfileType } from "../types/profile"
import type { Post } from "../../feed/types/post"
import { getApiErrorMessage } from "../../../utils/error"
import {
  getAuthToken,
  getCurrentUserIdFromToken,
  getCurrentUserRoleFromToken,
} from "../../auth/utils/auth"

function getInitials(username: string) {
  return username
    .split(/[\s._-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || username[0]?.toUpperCase() || "U"
}

function ProfileDetail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  )
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const { navigate } = useCollegeNavigation()
  const currentUserId = getCurrentUserIdFromToken()
  const currentUserRole = getCurrentUserRoleFromToken()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<ProfileFormValues>(profileToForm())
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [messagingLoading, setMessagingLoading] = useState(false)
  const [alumniStatus, setAlumniStatus] = useState<RequestStatus | "not_requested" | null>(null)
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false)
  const isOwnProfile = !userId || (!!profile && profile.user_id === currentUserId)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")

        let profileData: ProfileType

        if (userId) {
          const targetId = parseInt(userId, 10)
          profileData = targetId === currentUserId
            ? await getMyProfile()
            : await getUserProfile(targetId)
        } else {
          profileData = await getMyProfile()
        }
        const postsData = await getUserPosts(profileData.user_id)

        setProfile(profileData)
        setForm(profileToForm(profileData))
        setPosts(postsData || [])

        if (currentUserRole === "student" && (!userId || profileData.user_id === currentUserId)) {
          try {
            const req = await alumniRequestsAPI.getMyAlumniRequest()
            if (req?.status) {
              setAlumniStatus(req.status as RequestStatus)
            } else {
              setAlumniStatus("not_requested")
            }
          } catch {
            setAlumniStatus("not_requested")
          }
        }
      } catch (err: unknown) {
        console.error("Error loading profile:", err)
        setError(getApiErrorMessage(err, "Failed to load profile"))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, navigate, currentUserId, currentUserRole])

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setSaveError("")

    try {
      const updatedProfile = await updateProfile(formToProfilePayload(form))
      setProfile(updatedProfile)
      setForm(profileToForm(updatedProfile))
      setEditing(false)
    } catch (err: unknown) {
      console.error("Error updating profile:", err)
      setSaveError(getApiErrorMessage(err, "Failed to update profile"))
    } finally {
      setSaving(false)
    }
  }

  const handleMessage = async () => {
    if (!profile) return
    setMessagingLoading(true)
    try {
      const { conversation_id } = await startConversation(profile.user_id)
      navigate(`/messages/${conversation_id}`)
    } catch (err: unknown) {
      console.error("Error starting conversation:", err)
      alert("Failed to start conversation")
    } finally {
      setMessagingLoading(false)
    }
  }

  const handleGoToMessages = () => {
    navigate("/messages")
  }
  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">{error || "Profile not found"}</p>
          <div className="mt-4 text-center text-sm text-slate-600">
            <button
              onClick={() => navigate("/create-profile")}
              className="btn btn-primary"
            >
              Create profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile.full_name || profile.username

  return (
    <div className="app-page">
      <main className="app-main-wide space-y-6">
        <section className="surface-card overflow-hidden">
          <div className="h-32 bg-[linear-gradient(135deg,#0f172a,#2563eb_52%,#0f766e)]"></div>

          <div className="px-6 pb-6 pt-0">
            <div className="-mt-16 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={displayName}
                  className="h-32 w-32 rounded-lg border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-4 border-white bg-[linear-gradient(135deg,#2563eb,#0f766e)] text-5xl font-bold text-white shadow-lg">
                  {getInitials(profile.username)}
                </div>
              )}

              <div className="min-w-0 flex-1 pb-2">
                <h1 className="truncate text-3xl font-bold text-slate-950">{displayName}</h1>
                <p className="text-sm font-semibold text-slate-500">@{profile.username}</p>
              </div>

              {isOwnProfile ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleGoToMessages}
                    className="btn btn-primary"
                  >
                    Messages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing((current) => !current)
                      setForm(profileToForm(profile))
                      setSaveError("")
                    }}
                    className="btn bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {editing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <ConnectionButton
                    userId={profile.user_id}
                    initialStatus={profile.connection_status || "none"}
                  />
                  <button
                    onClick={handleMessage}
                    disabled={messagingLoading}
                    className="btn btn-primary"
                  >
                    {messagingLoading ? "Loading..." : "Message"}
                  </button>
                </div>
              )}
            </div>

            <p className="mb-5 leading-relaxed text-slate-700">
              {profile.bio || <span className="text-slate-400 italic">No bio provided</span>}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-5">
              <ProfileDetail label="Company" value={profile.company} />
              <ProfileDetail label="Title" value={profile.job_title} />
              <ProfileDetail label="Industry" value={profile.job_industry} />
              <ProfileDetail label="Location" value={profile.location} />
              <div className="sm:col-span-2 lg:col-span-4">
                <ProfileDetail label="Work" value={profile.job_description} />
              </div>
            </div>

            {/* Academic Status Section for Student Users */}
            {isOwnProfile && currentUserRole === "student" && (
              <div className="border-t border-slate-100 pt-4 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">Academic Status</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-slate-900">Student</span>
                        {alumniStatus === "pending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Alumni Status Pending Review
                          </span>
                        )}
                        {alumniStatus === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                            Upgrade Request Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {alumniStatus === "pending" ? (
                      <button
                        type="button"
                        onClick={() => setIsAlumniModalOpen(true)}
                        className="btn btn-secondary text-xs py-1.5 px-3"
                      >
                        View Status
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAlumniModalOpen(true)}
                        className="btn btn-primary text-xs py-1.5 px-3.5 shadow-sm"
                      >
                        Apply for Alumni Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div>
                <p className="font-bold text-slate-950">{posts.length}</p>
                <p className="text-slate-500">Posts</p>
              </div>
            </div>
          </div>
        </section>

        {editing && isOwnProfile && (
          <form onSubmit={handleSave} className="surface-card p-6 space-y-5">
            {saveError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {saveError}
              </div>
            )}

            <ProfileForm values={form} onChange={setForm} disabled={saving} />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setForm(profileToForm(profile))
                  setSaveError("")
                }}
                disabled={saving}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        <div>
          <h2 className="mb-4 text-2xl font-bold text-slate-950">Recent posts</h2>
          {posts.length === 0 ? (
            <div className="empty-state">
              <p className="font-semibold text-slate-700">No posts yet</p>
              <p className="mt-1 text-sm text-slate-500">This user has not shared anything yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Alumni Status Application Modal */}
      <RequestAlumniRole
        isOpen={isAlumniModalOpen}
        onClose={() => setIsAlumniModalOpen(false)}
        onSuccess={() => setAlumniStatus("pending")}
      />
    </div>
  )
}
