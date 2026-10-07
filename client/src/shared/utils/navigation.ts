import { useNavigate, useParams } from "react-router-dom"
import { useTenant } from "../../providers/TenantProvider"

/**
 * Ensures a path stays within the college context if collegeSlug is present.
 */
export function getCollegeScopedPath(collegeSlug: string | undefined | null, path: string): string {
  if (!collegeSlug) return path
  
  // If the path is already college-scoped or is super-admin route, return as is
  if (path.startsWith(`/c/${collegeSlug}`) || path.startsWith("/super-admin")) {
    return path
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `/c/${collegeSlug}${cleanPath}`
}

/**
 * Hook providing a navigate function that automatically preserves college context.
 */
export function useCollegeNavigation() {
  const navigate = useNavigate()
  const { collegeSlug: paramSlug } = useParams<{ collegeSlug?: string }>()
  const { tenant } = useTenant()
  const slug = paramSlug || tenant?.slug

  const collegeNavigate = (path: string, options?: { replace?: boolean; state?: unknown }) => {
    const targetUrl = getCollegeScopedPath(slug, path)
    navigate(targetUrl, options)
  }

  const getUrl = (path: string) => {
    return getCollegeScopedPath(slug, path)
  }

  return {
    navigate: collegeNavigate,
    getUrl,
    collegeSlug: slug,
  }
}
