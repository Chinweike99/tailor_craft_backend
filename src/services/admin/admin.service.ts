import { NotFoundError } from "../../utils/error.utils";
import { prisma } from "../../config/config";

export const getAllClients = async(filters: any ) => {
    const {page = 1, limit = 10} = filters;
    const skip = (page - 1 ) * limit;
    const clients = await prisma.user.findMany({
        where: {role: "CLIENT"},
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    const total = await prisma.user.count( {where: {role: 'CLIENT'}});

    return {
        data: clients,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


export const getClientById = async(clientId: string) => {
    const client = await prisma.user.findUnique({
        where: {id: clientId, role: 'CLIENT'},
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
            Booking: true,
        }
    });

    if(!client){
        throw new NotFoundError("Client not found")
    };
    return client;
};


export const deleteClient = async(clientId: string) => {
    const client = await prisma.user.findUnique({
        where: {id: clientId, role: 'CLIENT'}
    });
    if(!client){
        throw new NotFoundError("Client not found")
    };

    await prisma.user.delete({where: {id: clientId}});
    return {message: "Client sucessfully deleted"}
}


export const getAdminStats = async() => {
    const totalClients = await prisma.user.count({where: {role: 'CLIENT'}});
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {amount: true},
        where: {status: 'SUCCESS'}
    });
    const pendingBookings = await prisma.booking.count({
        where: {status: 'PENDING'}
    });

    return {
        totalClients,
        totalBookings,
        totalRevenue: totalRevenue._sum || 0,
        pendingBookings
    }
}



