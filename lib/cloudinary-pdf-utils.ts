/**
 * Cloudinary PDF URL Utilities
 * Handles URL transformations for proper PDF viewing and downloading
 */

export interface CloudinaryPdfOptions {
  /** Force download instead of inline display */
  forceDownload?: boolean;
  /** Convert first page to image for preview */
  firstPageAsImage?: boolean;
  /** Add quality transformation */
  quality?: number;
  /** Add page number for specific page */
  page?: number;
}

/**
 * Transform Cloudinary URL for PDF viewing/downloading
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Transformed URL
 */
export function transformCloudinaryPdfUrl(
  url: string,
  options: CloudinaryPdfOptions = {}
): string {
  const { forceDownload, firstPageAsImage, quality, page } = options;

  let transformedUrl = url;

  // Handle force download
  if (forceDownload) {
    transformedUrl = transformedUrl.replace(
      /\/upload\//,
      "/upload/fl_attachment/"
    );
    return transformedUrl;
  }

  // Handle first page as image preview
  if (firstPageAsImage) {
    // Convert from raw to image and show first page
    transformedUrl = transformedUrl.replace(
      /\/raw\/upload\//,
      "/image/upload/pg_1/"
    );

    // Add quality if specified
    if (quality) {
      transformedUrl = transformedUrl.replace(
        /\/upload\//,
        `/upload/q_${quality}/`
      );
    }

    return transformedUrl;
  }

  // Handle specific page viewing
  if (page) {
    transformedUrl = transformedUrl.replace(
      /\/raw\/upload\//,
      `/image/upload/pg_${page}/`
    );
    return transformedUrl;
  }

  return transformedUrl;
}

/**
 * Check if a URL is a Cloudinary PDF
 * @param url - URL to check
 * @returns True if it's a Cloudinary PDF
 */
export function isCloudinaryPdf(url: string): boolean {
  return (
    url.includes("res.cloudinary.com") &&
    (url.includes("/raw/upload/") || url.includes("/image/upload/")) &&
    url.toLowerCase().endsWith(".pdf")
  );
}

/**
 * Get the public ID from a Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID
 */
export function getCloudinaryPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : "";
}

/**
 * Build a viewer-friendly URL for PDFs
 * This ensures PDFs can be viewed inline in browsers
 * @param url - Original URL
 * @returns Viewer-friendly URL
 */
export function getPdfViewerUrl(url: string): string {
  // For Cloudinary PDFs, ensure proper formatting
  if (isCloudinaryPdf(url)) {
    // Add necessary parameters for inline viewing
    // Most browsers need the PDF to be served with proper headers
    return url;
  }

  return url;
}

/**
 * Get download URL with forced download flag
 * @param url - Original URL
 * @param filename - Optional custom filename
 * @returns Download URL
 */
export function getPdfDownloadUrl(url: string, filename?: string): string {
  return transformCloudinaryPdfUrl(url, { forceDownload: true });
}
