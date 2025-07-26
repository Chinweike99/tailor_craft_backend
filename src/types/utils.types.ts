import z from "zod";

export type ZodSchemaType<T> = z.ZodType<T, any, any>;

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
};

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationFilters extends PaginationParams {
    [key: string]: any;
}

export interface UploadedFile {
    filename: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    path: string;
    buffer?: Buffer;
}


