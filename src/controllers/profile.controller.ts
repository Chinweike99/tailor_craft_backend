import { NextFunction, Request, Response } from "express";
import { getProfile, updateProfile, uploadProfileImage } from "../services/profile.services";
import { UnauthorizedError } from "../utils/error.utils";
import { updateProfileSchema } from "../validation/profile.validation";
import { uploadToCloudinary } from "../utils/cloudinary.utils";


export const getProfileController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        // const {userId} = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }
        const response = await getProfile(userId);
        res.status(200).json({
            message: "User profile retrieved successfully",
            response
        })
    } catch (error) {
        next(error)
    }
}


export const updateProfileController = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const userId = req.user?.id;
        const data = updateProfileSchema.parse(req.body);

        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        const result = await updateProfile(userId, data);
        res.json({
            message: "User profile updated",
            result
        })

    } catch (error) {
        console.log("Error updating user profile: ", error)
        next(error)
       
    }
}


export const uploadProfileImageController = async (req: Request, res: Response) => {
    const userId = req.user?.id
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.path, "/public");
  const profile = await uploadProfileImage(userId as string , result.secure_url);
  res.json(profile);
  console.log("Image upload successful: ", profile)
};