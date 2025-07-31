import { Prisma, PrismaClient } from "@prisma/client"
import { NotFoundError } from "../utils/error.utils";
import z from "zod";
import { updateProfileSchema } from "../validation/profile.validation";


type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


const prisma = new PrismaClient();


export const getProfile = async (userId: string) => {
    const user =  await prisma.user.findUnique({
        where: {id: userId},
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            address: true,
            preferredPickupAddress: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    if(!user){
        throw new NotFoundError("User not found or does not exist")
    };

    return user;
}

export const updateProfile = async(userId: string, data: UpdateProfileInput) => {
    const user = await prisma.user.update({
        where: {id: userId},
        data: {
            ...data,
            address: data.address as Prisma.InputJsonValue,
            preferredPickupAddress: data.preferredPickupAddress as Prisma.InputJsonValue,
            },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            address: true,
            preferredPickupAddress: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
    },
    });

    return user;
}


export const uploadProfileImage = async(userId: string, imageUrl: string) => {
    const user = await prisma.user.update({
        where: {id: userId},
        data: {profileImage: imageUrl},
        select: {
            id: true,
            profileImage: true
        }
    });
    return user;
}



