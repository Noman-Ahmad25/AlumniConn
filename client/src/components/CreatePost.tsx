import { useState } from "react"
import { createPost } from "../api/post"
import type { Post } from "../types/post"
import { getApiErrorMessage } from "../utils/error"
import { getCurrentUserRoleFromToken } from "../utils/auth"

export default function CreatePost( { onPostCreated }: {
    onPostCreated: (post: Post) => void
}){
    const [content, setContent] = useState<string>("")
    const [imageUrl, setImageUrl] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [isOpportunity, setIsOpportunity] = useState<boolean>(false)
    const canCreateOpportunity = getCurrentUserRoleFromToken() === "alumni"

    const isDisabled = !content.trim() && !imageUrl.trim()

    const handleSubmit = async () => {
        if(isDisabled) return

        setLoading(true)
        setError("")

        try {
            const newPost = await createPost({
                content: content.trim(),
                image_url: imageUrl.trim(),
                is_opportunity: canCreateOpportunity && isOpportunity
            })
            onPostCreated(newPost)
            setContent("")
            setImageUrl("")
            setIsOpportunity(false)
            setShowPreview(false)
        }
        catch(error: unknown){
            console.error("Error creating post", error)
            setError(getApiErrorMessage(error, "Failed to create post"))
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <section className="surface-card p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="avatar h-10 w-10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-950">Share your thoughts</p>
                    <p className="text-xs text-slate-500">Post an update, question, or opportunity.</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <textarea
                placeholder="Share your ideas, experiences, or opportunities..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                className="form-field resize-none"
                rows={4}
            />

            <div className="space-y-2">
                <input
                    type="url"
                    placeholder="Paste image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={loading}
                    className="form-field"
                />
                <p className="text-xs text-slate-500">Supports JPG, PNG, GIF, and WebP.</p>
            </div>

            {imageUrl && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3">
                        <span className="text-sm font-bold text-slate-700">Image preview</span>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="rounded-md px-3 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
                        >
                            {showPreview ? "Hide" : "Show"}
                        </button>
                    </div>
                    {showPreview && (
                        <div className="p-3">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="max-h-64 w-full rounded-lg object-cover"
                                onError={() => setError("Failed to load image")}
                            />
                        </div>
                    )}
                </div>
            )}

            {canCreateOpportunity && (
                <label className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <input
                        type="checkbox"
                        checked={isOpportunity}
                        onChange={(event) => setIsOpportunity(event.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>
                        <span className="block font-bold">Mark as Opportunity</span>
                        <span className="text-emerald-700">Share this as an alumni opportunity for your college network.</span>
                    </span>
                </label>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                    {!isDisabled && (
                        <button
                            onClick={() => {
                                setContent("")
                                setImageUrl("")
                                setIsOpportunity(false)
                                setShowPreview(false)
                                setError("")
                            }}
                            disabled={loading}
                            className="btn btn-secondary min-h-0 px-3 py-2"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isDisabled || loading}
                    className={`btn px-5 ${
                        isDisabled || loading
                            ? "btn-secondary"
                            : "btn-primary"
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Posting...
                        </span>
                    ) : (
                        "Post"
                    )}
                </button>
            </div>

            {isDisabled && (
                <p className="py-1 text-center text-xs text-slate-500">Add content or an image to post.</p>
            )}
        </section>
    )
}
