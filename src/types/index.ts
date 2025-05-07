import { Document } from "mongoose";

// Basic User/Client types
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileImage?: string;
  role: "client" | "admin" | "tailor";
  measurements?: IMeasurements;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Measurement type
export interface IMeasurements {
  neck?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  sleeve?: number;
  inseam?: number;
  outseam?: number;
  thigh?: number;
  calf?: number;
  ankle?: number;
  wrist?: number;
  armLength?: number;
  height?: number;
  other?: string;
}

// Service Category
export type ServiceCategory =
  | 'native'
  | 'corporate'
  | 'casual'
  | 'sportswear'
  | 'custom';


// Service definition
export interface IService extends Document {
    title: string;
    description: string;
    category: ServiceCategory;
    priceRange: string;
    imageUrl: string[];
    estimatedDays: number;
    features?: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  // Portfolio
export interface IPortfolioItem extends Document {
    title: string;
    description: string;
    category: ServiceCategory;
    imageUrl: string;
    featured: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  // Booking / Appointment
export interface IBooking extends Document {
    clientId: string;
    serviceType: ServiceCategory;
    specificStyle?: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    measurements?: IMeasurements;
    inspirationPhotoUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Testimonials
export interface ITestimonial extends Document {
    clientId: string;
    clientName: string;
    clientImage?: string;
    rating: number;
    text: string;
    date: Date;
    serviceType: ServiceCategory;
    createdAt: Date;
    updatedAt: Date;
  }

  // Chat Message
export interface IMessage extends Document {
    sender: string;
    recipient: string;
    content: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

// Authentication DTOs
export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    // phone: string;
};

export interface LoginDTO{
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        profileImage?: string;
    };
    token: string;
};

// Booking DTOs
export interface CreateBookingDTO {
    serviceType: ServiceCategory;
    specificStyle?: string;
    date: string;
    measurements?: IMeasurements;
    inspirationPhotoUrl?: string;
    notes?: string;
  }


export interface ApiError extends Error {
    statusCode: number;
    errors?: any;
}




