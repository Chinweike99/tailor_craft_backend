import { NextFunction, Request, Response } from "express"
import { ZodError, ZodSchema } from "zod"
import { ValidationError } from "../utils/error.utils"


export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            })
            next()
        } catch (error) {
            if(error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = error.issues.reduce(
                    (acc, issue) => {
                        const key = issue.path.join(".") || "form";
                        acc[key] = acc[key] || [];
                        acc[key].push(issue.message);
                        return acc;
                    },
                    {} as Record<string, string[]>
                );
                next(new ValidationError(formattedErrors))
            }else{
                next(error)
            }
        }
    }
}


export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        }  catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = error.issues.reduce(
          (acc, issue) => {
            const key = issue.path.join(".") || "body";
            acc[key] = acc[key] || [];
            acc[key].push(issue.message);
            return acc;
          },
          {} as Record<string, string[]>
        );

        next(new ValidationError(formattedErrors));
      } else {
        next(error); // unknown error
      }
    }
  };
}

export const validateQuery = (schema: ZodSchema) => {
    return(req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.query)
        }  catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = error.issues.reduce(
          (acc, issue) => {
            const key = issue.path.join(".") || "query";
            acc[key] = acc[key] || [];
            acc[key].push(issue.message);
            return acc;
          },
          {} as Record<string, string[]>
        );

        next(new ValidationError(formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

export const validateParams = (schema: ZodSchema) => {
    return(req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.params);
            next();
        }  catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = error.issues.reduce(
          (acc, issue) => {
            const key = issue.path.join(".") || "params";
            acc[key] = acc[key] || [];
            acc[key].push(issue.message);
            return acc;
          },
          {} as Record<string, string[]>
        );

        next(new ValidationError(formattedErrors));
      } else {
        next(error);
      }
    }
  };
}






