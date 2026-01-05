import { Prisma } from "@prisma/client";
import { uploadToCloudinary } from "../../utils/cloudinary.utils";
import { NotFoundError } from "../../utils/error.utils";
import { Express } from 'express';
import { prisma } from "../../config/database";


export const createDesign = async(data:any, images: string[]) => {
    const design = await prisma.design.create({
        data: {
            ...data,
            images
        }
    });
    return design;
}


export const getDesigns = async(filter: any = {}) => {
    const {category, isActive, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.DesignWhereInput = {
        ...(category && category),
    } 
    if(isActive !== undefined ) where.isActive = isActive

    const designs = await prisma.design.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc'}
    });
    const total = await prisma.design.count({where});

    return {
        data: designs,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

}


export const getDesignById = async (id: string) => {
  const design = await prisma.design.findUnique({ where: { id } });

  if (!design) {
    throw new NotFoundError('Design not found');
  }

  return design;
};

export const updateDesign = async (id: string, data: any) => {
  const design = await prisma.design.update({
    where: { id },
    data,
  });

  return design;
};

export const deleteDesign = async (id: string) => {
  await prisma.design.delete({ where: { id } });
  return { message: 'Design deleted successfully' };
};



export const uploadDesignImages = async(files: Express.Multer.File[]) => {
    const uploadDesign = files.map(file => uploadToCloudinary(file.path, 'upload'));
    return Promise.all(uploadDesign)
}


// export const uploadDesignImages = async(files: Express.Multer.File[]) => {
//     try {
//         console.log("Starting image uploads, file count:", files.length);
        
//         const uploadPromises = files.map((file, index) => {
//             console.log(`Uploading file ${index + 1}:`, file.originalname, "from path:", file.path);
//             return uploadToCloudinary(file.path, 'designs');
//         });
        
//         const results = await Promise.all(uploadPromises);
//         console.log("All uploads completed:", results.length, "files uploaded");
        
//         return results;
//     } catch (error) {
//         console.error("Error in uploadDesignImages:", error);
//         throw error;
//     }
// }