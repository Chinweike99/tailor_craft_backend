import { NextFunction, Request, Response } from "express";
import { deleteClient, getAdminStats, getAllClients, getClientById } from "../../services/admin/admin.service";
import z from "zod";



const getClientsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});



export const getAllClientsController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const  filters = getClientsSchema.parse(req.query);
        const resonse = await getAllClients(filters)
        res.status(201).json({
            status: "Success",
            resonse
        })
    } catch (error) {
        next(error)
    }
}



export const getClientByIdCntroller = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.id;
        const response = await getClientById(clientId);
        res.status(201).json({
            status: "Success",
            response
        })

    } catch (error) {
        next(error)
    }
};

export const deleteClientController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.params.id;
        const response =  await deleteClient(clientId);
        res.status(201).json({
            status: "Success",
            response
        })
    } catch (error) {
        next(error)
    }
};


export const getAdminStatsController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await getAdminStats();
        res.status(201).json({
            status: 'success',
            stats
        })
    } catch (error) {
        next(error)
    }
}


