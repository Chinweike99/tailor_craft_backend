// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'CLIENT';
  isVerified: boolean;
  profileImage?: string;
  bio?: string;
  address?: Address;
  preferredPickupAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Design Types
export interface Design {
  id: string;
  title: string;
  description: string;
  images: string[];
  priceRange: {
    min: number;
    max: number;
  };
  category: 'NATIVE' | 'CASUAL' | 'FORMAL';
  minimumDeliveryTime: number;
  requiredMaterials: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignCreateInput {
  title: string;
  description: string;
  images: string[];
  priceRange: {
    min: number;
    max: number;
  };
  category: 'NATIVE' | 'CASUAL' | 'FORMAL';
  minimumDeliveryTime: number;
  requiredMaterials: string[];
  isActive?: boolean;
}

// Booking Types
export type BookingStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | '60%_PAID' | 'PAID';

export interface Booking {
  id: string;
  userId: string;
  designId?: string;
  customDesign?: {
    title: string;
    description: string;
    images: string[];
  };
  measurements: Record<string, any>;
  deliveryDate: Date;
  notes?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  declineReason?: string;
  hasReview: boolean;
  createdAt: Date;
  updatedAt: Date;
  design?: Design;
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  payments?: Payment[];
}

export interface BookingCreateInput {
  designId?: string;
  customDesign?: {
    title: string;
    description: string;
    images: string[];
  };
  measurements: Record<string, any>;
  deliveryDate: Date;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  isInstallment: boolean;
  paymentReference?: string;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: Pick<User, 'id' | 'name' | 'profileImage'>;
  booking?: {
    design?: Design;
    customDesign?: {
      title: string;
      description: string;
      images: string[];
    };
  };
}

// Guide Types
export interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'DOCUMENT';
  resourceUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Material Types
export interface Material {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination Types
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}