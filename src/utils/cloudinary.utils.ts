import { v2 as cloudinary } from "cloudinary";
import config from "../config/config";
import fs from "fs";
// import { UploadedFile } from "../types/utils.types";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: any
): Promise<{ public_id: string; secure_url: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    // Delete File from local storage after upload
    fs.unlinkSync(filePath);
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

// export const uploadMultipleToCloudinary = async (
//   files: UploadedFile[],
//   folder = "tailorcraft"
// ): Promise<Array<{ public_id: string; secure_url: string }>> => {
//   const uploadPromises = files.map((file) =>
//     uploadToCloudinary(file.path, folder)
//   );
//   return Promise.all(uploadPromises);
// };