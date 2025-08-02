import { Prisma, PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../../utils/cloudinary.utils";
import { NotFoundError } from "../../utils/error.utils";


const prisma = new PrismaClient();


export const createDesign = async(data:any, images: string[]) => {
    const design = await prisma.design.create({
        ...data,
        images
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
    const uploadDesign = files.map(file => uploadToCloudinary(file.path, '../../upload'));
    return Promise.all(uploadDesign)
}
