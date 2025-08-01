import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import config from './config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export const uploadToCloudinary = async (filePath: string, folder = 'default') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      width: 1500,
      crop: 'limit',
      transformation: [
        { if: "w_gt_1500", width: 1500, crop: "scale" },
        { if: "h_gt_1500", height: 1500, crop: "scale" },
        { quality: "auto:eco" }
      ]
    });

    // Clean up local file
    fs.unlinkSync(filePath);

    return {
      public_id: result.public_id,
      url: result.secure_url,
      optimized_url: cloudinary.url(result.public_id, {
        quality: 'auto',
        fetch_format: 'auto',
        width: 800,
        crop: 'scale'
      })
    };
  } catch (error) {
    // Ensure cleanup even on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async(publicId: string) => {
    await cloudinary.uploader.destroy(publicId, {
        invalidate: true
    })
}

export const uploadProfileImage = async (filePath: string) => {
    return uploadToCloudinary(filePath, 'tailorcraft/profile-image')
}


