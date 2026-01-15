import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder name
 * @param fileName - Original file name with extension
 * @param resourceType - Type of resource (image, raw, video, auto)
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "documents",
  fileName: string = "file",
  resourceType: "image" | "raw" | "video" | "auto" = "raw"
) {
  try {
    // Extract file extension
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const fileNameWithoutExt = fileName.substring(
      0,
      fileName.lastIndexOf(".")
    );

    // Create a unique public ID
    const publicId = `${fileNameWithoutExt}_${Date.now()}`;

    console.log("Uploading to Cloudinary:", {
      folder: `effideli/${folder}`,
      publicId: `${publicId}${fileExtension}`,
      resourceType,
      isBuffer: Buffer.isBuffer(file),
    });

    // For raw files, we need to handle the upload differently
    const uploadOptions: any = {
      folder: `effideli/${folder}`,
      resource_type: resourceType,
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
      overwrite: true,
    };

    // Upload the file
    const result = await cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: any, result: any) => {
        if (error) {
          throw new Error(`Cloudinary error: ${error.message}`);
        }
        return result;
      }
    );

    // If file is Buffer, use a different approach
    let uploadResult;
    if (Buffer.isBuffer(file)) {
      // Use upload instead of upload_stream for Buffer
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // For base64 strings
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    console.log("Cloudinary upload successful:", {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      `Failed to upload file to Cloudinary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - Type of resource (image, raw, video)
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "raw"
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
}
