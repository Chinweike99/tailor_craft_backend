import { Prisma } from "@prisma/client";
import { NotFoundError } from "../../utils/error.utils";
import { prisma } from "../../config/config";

export const createGuide = async(data: Prisma.GuideCreateInput) => {
    const guide = await prisma.guide.create({
        data: {
            ...data
        }
    });
    return guide
}


export const getGuide = async(filters: any = {} ) => {
    const {type, page = 1, limit = 10} = filters;
    const skip = (page - 1) * limit
    const where: Prisma.GuideWhereInput = {
        ...(type && {type})
    };
    
    const guides = await prisma.guide.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc'}
    });

    const total = await prisma.guide.count({where})
    return {
        data: guides,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil( total / limit)
        }
    }

}

export const getGuideById = async(guideId: string) => {
    const guide = await prisma.guide.findUnique({where: {id: guideId}});
    if(!guide){
        throw new NotFoundError("Guide not found");
    }
    return guide
};


export const updateGuide = async(guideId: string, data: Prisma.GuideUpdateInput) => {
    if(!guideId){
        throw new NotFoundError("Unable to update guide, guide does not exist")
    }
    const update = await prisma.guide.update({
        where: {id: guideId},
        data
    });
    return update;
};

export const deleteGuide = async (id: string) => {
  await prisma.guide.delete({ where: { id } });
  return { message: 'Guide deleted successfully' };
};