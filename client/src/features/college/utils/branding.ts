/**
 * Utility functions for tenant branding, color contrast calculations,
 * dynamic favicon loading, and document head metadata injection.
 */

/**
 * Calculates whether black or white text has better contrast on a given background hex color.
 * Uses the YIQ relative luminance formula.
 */
export function getContrastColor(hexColor: string | null | undefined): string {
    if (!hexColor) return "#ffffff"; // Default fallback to white text
    
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return "#ffffff";
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Relative luminance calculation
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#0f172a" : "#ffffff"; // Slate 900 for dark text, clean white for light text
}

/**
 * Dynamically updates the browser favicon.
 * Falls back to /favicon.svg if logoUrl is omitted, null, or undefined.
 */
export function updateFavicon(logoUrl?: string | null) {
    const targetUrl = logoUrl || "/favicon.svg";
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    if (targetUrl.endsWith(".svg") || targetUrl.includes(".svg")) {
        link.type = "image/svg+xml";
    } else {
        link.type = "image/png";
    }
    link.href = targetUrl;
}

/**
 * Dynamic metadata injection for SEO and white-labeling.
 */
export function updateMetaTags(title: string, description: string | null | undefined) {
    document.title = title;
    
    let metaDescription: HTMLMetaElement | null = document.querySelector("meta[name='description']");
    if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.getElementsByTagName("head")[0].appendChild(metaDescription);
    }
    metaDescription.content = description || `Join the alumni network for ${title}.`;
}
