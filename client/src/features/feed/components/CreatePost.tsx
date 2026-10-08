import { useState, useEffect, type ChangeEvent } from "react"
import { createPost } from "../api/post"
import type { Post } from "../types/post"
import { getApiErrorMessage } from "../../../utils/error"
import { getCurrentUserRoleFromToken } from "../../auth/utils/auth"

export interface CreatePostProps {
    onPostCreated: (post: Post) => void
    isOpen?: boolean
    onClose?: () => void
}

export default function CreatePost({
    onPostCreated,
    isOpen = true,
    onClose
}: CreatePostProps) {
    const [content, setContent] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [isOpportunity, setIsOpportunity] = useState<boolean>(false)
    const role = getCurrentUserRoleFromToken()
    const canCreateOpportunity = role === "alumni" || role === "admin" || role === "super_admin"

    const isDisabled = !content.trim() && !selectedFile

    useEffect(() => {
        if (!isOpen || !onClose) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [isOpen, onClose])

    if (!isOpen) {
        return null
    }

    // Handle File Selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            setShowPreview(true)
            setError("")
        }
    }

    const resetForm = () => {
        setContent("")
        setSelectedFile(null)
        setPreviewUrl("")
        setIsOpportunity(false)
        setShowPreview(false)
        setError("")
    }

    const handleSubmit = async () => {
        if (isDisabled) return

        setLoading(true)
        setError("")

        try {
            const newPost = await createPost({
                content: content.trim(),
                is_opportunity: canCreateOpportunity && isOpportunity,
                image_file: selectedFile
            })
            onPostCreated(newPost)
            resetForm()
            if (onClose) {
                onClose()
            }
        }
        catch (error: unknown) {
            console.error("Error creating post", error)
            setError(getApiErrorMessage(error, "Failed to create post"))
        }
        finally {
            setLoading(false)
        }
    }

    const formBody = (
        <div className="space-y-4">
            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="post-content-textarea" className="sr-only">
                    Post Content
                </label>
                <textarea
                    id="post-content-textarea"
                    placeholder="Share your ideas, experiences, or opportunities..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    className="form-field resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    autoFocus={Boolean(onClose)}
                />
            </div>

            {/* File Input */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Add an image (Optional)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    aria-label="Upload post image"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-slate-400">Supports JPG, PNG, GIF, and WebP.</p>
            </div>

            {/* Image Preview using previewUrl */}
            {previewUrl && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2.5 px-3">
                        <span className="text-xs font-bold text-slate-700">Image selected</span>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="rounded-md px-2.5 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
                        >
                            {showPreview ? "Hide" : "Show"}
                        </button>
                    </div>
                    {showPreview && (
                        <div className="p-3 relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-60 w-full rounded-lg object-cover"
                            />
                            <button 
                                type="button"
                                onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                                className="absolute top-5 right-5 flex h-7 w-7 items-center justify-center bg-slate-900/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                                title="Remove image"
                                aria-label="Remove image"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {canCreateOpportunity && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:border-slate-300">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <label htmlFor="is-opportunity-checkbox" className="text-sm font-semibold text-slate-900 cursor-pointer">
                                Mark as Opportunity / Job Opening
                            </label>
                            <p className="text-xs text-slate-500">
                                Feature this post in the Opportunities tab for students and fellow alumni.
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                        <input
                            id="is-opportunity-checkbox"
                            type="checkbox"
                            checked={isOpportunity}
                            onChange={(e) => setIsOpportunity(e.target.checked)}
                            disabled={loading}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>
            )}

            {/* Buttons Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn btn-secondary min-h-0 px-3.5 py-2 text-xs"
                        >
                            Cancel
                        </button>
                    )}
                    {!isDisabled && (
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={loading}
                            className="btn btn-secondary min-h-0 px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isDisabled || loading}
                    className={`btn px-5 text-sm ${isDisabled || loading ? "btn-secondary" : "btn-primary"}`}
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    )

    // Modal Mode (when onClose is provided)
    if (onClose) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose()
                    }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-post-modal-title"
            >
                <div
                    className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden p-5 sm:p-6 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <h2 id="create-post-modal-title" className="text-base font-bold text-slate-900">
                                    Create a Post
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Share ideas, updates, or opportunities with your campus network
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {formBody}
                </div>
            </div>
        )
    }

    // Default Embedded Mode
    return (
        <section className="surface-card p-5 space-y-4">
            {formBody}
        </section>
    )
}
