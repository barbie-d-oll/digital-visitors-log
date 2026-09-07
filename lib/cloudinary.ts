import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

// Configure Cloudinary: use individual env variables if provided,
// otherwise preserve auto-configuration from CLOUDINARY_URL without overriding with undefined.
const configOptions: Record<string, any> = {
  secure: true,
};

if (process.env.CLOUDINARY_CLOUD_NAME) {
  configOptions.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
}
if (process.env.CLOUDINARY_API_KEY) {
  configOptions.api_key = process.env.CLOUDINARY_API_KEY;
}
if (process.env.CLOUDINARY_API_SECRET) {
  configOptions.api_secret = process.env.CLOUDINARY_API_SECRET;
}

cloudinary.config(configOptions);

/**
 * Uploads a file buffer directly to Cloudinary.
 * Designed for serverless environments (e.g. Vercel) where local disk write is not available.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
