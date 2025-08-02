import { NextFunction, Request, Response } from "express";
import { createDesignSchema, getDesignsSchema, updateDesignSchema } from "../../validation/design";
import { createDesign, deleteDesign, getDesignById, getDesigns, updateDesign, uploadDesignImages } from "../../services/admin/design.service";



export const createDesignController = async(req: Request, res: Response, next: NextFunction) => {
    console.log("Endpoint is hit")
    try {
        const validateData  = createDesignSchema.parse(req.body);
        if(!req.files || !Array.isArray(req.files)){
            throw new Error("No images uploaded")
        }
        console.log("Endpoint is hit", validateData)
        const images = await uploadDesignImages(req.files)
        console.log("Images is hit", images)
        const design = await createDesign(validateData, images.map(img => img.secure_url));
        console.log("Design is hit " + JSON.stringify(design, null, 2));
        res.status(200).json({
            status: "success",
            design
        })
        console.log(design)
    } catch (error) {
        next(error)
    }
}

export const getDesignsController = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = getDesignsSchema.parse(req.query);
        const response = await getDesigns(filters);
        res.status(200).json({
            status: 'success',
            response
        })
    } catch (error) {
        next(error)
    }
};


export const getDesignByIdController = async (req: Request, res: Response) => {
  const design = await getDesignById(req.params.id);
  res.json(design);
};

export const updateDesignController = async (req: Request, res: Response) => {
  const validatedData = updateDesignSchema.parse(req.body);
  const design = await updateDesign(req.params.id, validatedData);
  res.json(design);
};

export const deleteDesignController = async (req: Request, res: Response) => {
  const result = await deleteDesign(req.params.id);
  res.json(result);
};

