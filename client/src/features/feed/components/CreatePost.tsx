import { useState, type ChangeEvent } from "react" // Added ChangeEvent
import { createPost } from "../api/post"
import type { Post } from "../types/post"
import { getApiErrorMessage } from "../../../utils/error"
import { getCurrentUserRoleFromToken } from "../../auth/utils/auth"

export default function CreatePost({ onPostCreated }: {
    onPostCreated: (post: Post) => void
}) {
    const [content, setContent] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null) // State for the actual file
    const [previewUrl, setPreviewUrl] = useState<string>("") // State for the preview URL
    const [loading, setLoading] = useState<boolean>(false)
    // @ts-expect-error unused variable
    const [error, setError] = useState<string>("")
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [isOpportunity, setIsOpportunity] = useState<boolean>(false)
    const canCreateOpportunity = getCurrentUserRoleFromToken() === "alumni"

    const isDisabled = !content.trim() && !selectedFile

    // Handle File Selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file)) // Create a temporary local URL for preview
            setShowPreview(true)
            setError("")
        }
    }

    const handleSubmit = async () => {
        if (isDisabled) return

        setLoading(true)
        setError("")

        try {
            const newPost = await createPost({
                content: content.trim(),
                is_opportunity: canCreateOpportunity && isOpportunity,
                image_file: selectedFile // Pass the file object
            })
            onPostCreated(newPost)
            
            // Reset form
            setContent("")
            setSelectedFile(null)
            setPreviewUrl("")
            setIsOpportunity(false)
            setShowPreview(false)
        }
        catch (error: unknown) {
            console.error("Error creating post", error)
            setError(getApiErrorMessage(error, "Failed to create post"))
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <section className="surface-card p-5 space-y-4">
            {/* Header ... keep same */}
            
            {/* Error ... keep same */}

            <textarea
                placeholder="Share your ideas, experiences, or opportunities..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                className="form-field resize-none"
                rows={4}
            />

            {/* UPDATED: File Input instead of URL Input */}
            <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Add an image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-500">Supports JPG, PNG, GIF, and WebP.</p>
            </div>

            {/* Image Preview using previewUrl */}
            {previewUrl && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3">
                        <span className="text-sm font-bold text-slate-700">Image selected</span>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="rounded-md px-3 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
                        >
                            {showPreview ? "Hide" : "Show"}
                        </button>
                    </div>
                    {showPreview && (
                        <div className="p-3 relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-64 w-full rounded-lg object-cover"
                            />
                            <button 
                                onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                                className="absolute top-5 right-5 bg-rose-500 text-white rounded-full p-1"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Opportunity Checkbox ... keep same */}

            {/* Buttons Footer ... update clear button logic */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                    {!isDisabled && (
                        <button
                            onClick={() => {
                                setContent("")
                                setSelectedFile(null)
                                setPreviewUrl("")
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
                    className={`btn px-5 ${isDisabled || loading ? "btn-secondary" : "btn-primary"}`}
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </section>
    )
}
