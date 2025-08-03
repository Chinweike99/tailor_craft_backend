import { NextFunction, Request, Response } from "express";
import { createGuideSchema, getGuidesSchema, updateGuideSchema } from "../../validation/guide";
import { createGuide, deleteGuide, getGuide, getGuideById, updateGuide } from "../../services/admin/guide.service";




export const createGuideController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const validateData = createGuideSchema.parse(req.body);
        const response = await createGuide(validateData);
        res.status(200).json({
            status: "success",
            response
        })
    } catch (error) {
        next(error)
    }
}


export const getGuideController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const guide = getGuidesSchema.parse(req.query);
        const response = await getGuide(guide);
        res.status(200).json({
            status: "success",
            response
        })
    } catch (error) {
        next(error)
    }
};

export const getGuideByIdController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const guideId = req.params.id;
        const response = await getGuideById(guideId);
        res.status(200).json({
            status: "success",
            response
        })
    } catch (error) {
        next(error)
    }
}


export const updateGuideController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const guideId = req.params.id;
        const update = updateGuideSchema.parse(req.body)
        const response = await updateGuide(guideId, update);
         res.status(200).json({
            status: "success",
            response
        })
    } catch (error) {
        next(error)
    }
}


export const deleteGuideController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteGuide(req.params.id);
    res.status(200).json({
            status: "success",
            result
        })
  } catch (error) {
    next(error)
  }
};

