import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TailorCraft API Documentation',
    version: '1.0.0',
    description: `
      ## Welcome to TailorCraft API
      
      A comprehensive backend API for a custom tailoring service platform. This API enables clients to book custom tailoring services, manage bookings, make payments, and interact with tailors efficiently.
      
      ### Key Features
      - **Authentication & Authorization**: JWT-based with role-based access control
      - **Payment Integration**: Paystack payment gateway with webhook support
      - **File Upload**: Cloudinary integration for images
      - **Email Notifications**: Automated emails for OTPs, bookings, and reminders
      - **Automated Services**: Background jobs for cleanup, reminders, and keep-alive
      
      ### Base URL
      - **Development**: http://localhost:4000/api-docs/
      - **Production**: https://tailorcraft.onrender.com/api-docs/
      
      ### Authentication
      Most endpoints require authentication. Include the JWT token in the Authorization header:
      \`\`\`
      Authorization: Bearer <your-access-token>
      \`\`\`
      
      ### Rate Limiting
      - **Limit**: 100 requests per 15 minutes
      - **Window**: 15 minutes
    `,
    contact: {
      name: 'TailorCraft Support',
      email: 'tailorcraft.fashion@gmail.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Development Server',
    },
    {
      url: 'https://tailor-craft-backend.onrender.com/api/v1',
      description: 'Production Server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Profile',
      description: 'User profile management endpoints',
    },
    {
      name: 'Bookings',
      description: 'Booking creation and management endpoints',
    },
    {
      name: 'Payments',
      description: 'Payment processing and verification endpoints',
    },
    {
      name: 'Designs',
      description: 'Design catalog management endpoints',
    },
    {
      name: 'Guides',
      description: 'Measurement guides and tutorials endpoints',
    },
    {
      name: 'Reviews',
      description: 'Customer reviews and ratings endpoints',
    },
    {
      name: 'Admin',
      description: 'Admin-only endpoints for client and system management',
    },
    {
      name: 'Health',
      description: 'System health check endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      // Error Responses
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Error message description',
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      
      // Auth Schemas
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'phone', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
            description: 'Full name of the user',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
            description: 'Valid email address',
          },
          phone: {
            type: 'string',
            example: '08012345678',
            description: 'Phone number (Nigerian format)',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecurePassword123!',
            description: 'Strong password (min 8 characters)',
          },
        },
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'OTP Sent to email',
          },
          data: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                example: 'john.doe@example.com',
              },
            },
          },
        },
      },
      VerifyOTPRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          otp: {
            type: 'string',
            example: '123456',
            description: '6-digit OTP code',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecurePassword123!',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          tokens: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              refreshToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          otp: {
            type: 'string',
            example: '123456',
          },
          newPassword: {
            type: 'string',
            format: 'password',
            example: 'NewSecurePassword123!',
          },
        },
      },
      
      // User Schema
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          phone: {
            type: 'string',
            example: '08012345678',
          },
          role: {
            type: 'string',
            enum: ['CLIENT', 'ADMIN'],
            example: 'CLIENT',
          },
          isVerified: {
            type: 'boolean',
            example: true,
          },
          profileImage: {
            type: 'string',
            nullable: true,
            example: 'https://res.cloudinary.com/...',
          },
          bio: {
            type: 'string',
            nullable: true,
            example: 'Fashion enthusiast',
          },
          address: {
            type: 'object',
            nullable: true,
            properties: {
              street: {
                type: 'string',
              },
              city: {
                type: 'string',
              },
              state: {
                type: 'string',
              },
              country: {
                type: 'string',
              },
            },
          },
          preferredPickupAddress: {
            type: 'object',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      
      // Profile Schemas
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'John Updated',
          },
          phone: {
            type: 'string',
            example: '08087654321',
          },
          bio: {
            type: 'string',
            example: 'Updated bio description',
          },
          address: {
            type: 'object',
            properties: {
              street: {
                type: 'string',
                example: '123 Main Street',
              },
              city: {
                type: 'string',
                example: 'Lagos',
              },
              state: {
                type: 'string',
                example: 'Lagos',
              },
              country: {
                type: 'string',
                example: 'Nigeria',
              },
            },
          },
          preferredPickupAddress: {
            type: 'object',
            properties: {
              street: {
                type: 'string',
              },
              city: {
                type: 'string',
              },
              state: {
                type: 'string',
              },
            },
          },
        },
      },
      
      // Booking Schemas
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          designId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          customDesign: {
            type: 'object',
            nullable: true,
            properties: {
              description: {
                type: 'string',
              },
              images: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
          measurements: {
            type: 'object',
            properties: {
              chest: {
                type: 'string',
                example: '42',
              },
              waist: {
                type: 'string',
                example: '34',
              },
              shoulder: {
                type: 'string',
                example: '18',
              },
              sleeve: {
                type: 'string',
                example: '24',
              },
            },
          },
          deliveryDate: {
            type: 'string',
            format: 'date-time',
          },
          notes: {
            type: 'string',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            example: 'PENDING',
          },
          paymentStatus: {
            type: 'string',
            enum: ['UNPAID', 'PARTIAL', 'SUCCESS', 'REFUNDED', 'PROCESSING', 'PENDING'],
            example: 'UNPAID',
          },
          totalAmount: {
            type: 'number',
            example: 50000,
          },
          declineReason: {
            type: 'string',
            nullable: true,
          },
          hasReview: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateBookingRequest: {
        type: 'object',
        required: ['measurements', 'deliveryDate'],
        properties: {
          designId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of pre-designed style (optional if customDesign is provided)',
          },
          customDesign: {
            type: 'object',
            description: 'Custom design details (optional if designId is provided)',
            properties: {
              description: {
                type: 'string',
                example: 'Custom traditional agbada with gold embroidery',
              },
              images: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['https://example.com/image1.jpg'],
              },
            },
          },
          measurements: {
            type: 'object',
            required: ['chest', 'waist', 'shoulder', 'sleeve'],
            properties: {
              chest: {
                type: 'string',
                example: '42',
              },
              waist: {
                type: 'string',
                example: '34',
              },
              shoulder: {
                type: 'string',
                example: '18',
              },
              sleeve: {
                type: 'string',
                example: '24',
              },
              neck: {
                type: 'string',
                example: '16',
              },
              length: {
                type: 'string',
                example: '30',
              },
            },
          },
          deliveryDate: {
            type: 'string',
            format: 'date-time',
            example: '2026-02-15T00:00:00Z',
          },
          notes: {
            type: 'string',
            example: 'Please use silk material',
          },
        },
      },
      UpdateBookingStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['APPROVED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            example: 'APPROVED',
          },
          declineReason: {
            type: 'string',
            description: 'Required if status is DECLINED',
            example: 'Insufficient fabric availability',
          },
        },
      },
      
      // Payment Schemas
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          bookingId: {
            type: 'string',
            format: 'uuid',
          },
          amount: {
            type: 'number',
            example: 50000,
          },
          status: {
            type: 'string',
            enum: ['UNPAID', 'PARTIAL', 'SUCCESS', 'REFUNDED', 'PROCESSING', 'PENDING'],
          },
          isInstallment: {
            type: 'boolean',
            example: false,
          },
          paymentReference: {
            type: 'string',
            nullable: true,
          },
          paymentUrl: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      InitializePaymentRequest: {
        type: 'object',
        properties: {
          isInstallment: {
            type: 'boolean',
            example: false,
            description: 'Set to true for partial payment',
          },
          amount: {
            type: 'number',
            example: 25000,
            description: 'Required if isInstallment is true',
          },
        },
      },
      InitializePaymentResponse: {
        type: 'object',
        properties: {
          paymentUrl: {
            type: 'string',
            example: 'https://checkout.paystack.com/abc123',
          },
          reference: {
            type: 'string',
            example: 'REF_abc123xyz',
          },
          amount: {
            type: 'number',
            example: 50000,
          },
        },
      },
      PaymentStats: {
        type: 'object',
        properties: {
          totalRevenue: {
            type: 'number',
            example: 500000,
          },
          totalPayments: {
            type: 'number',
            example: 10,
          },
          successfulPayments: {
            type: 'number',
            example: 8,
          },
          pendingPayments: {
            type: 'number',
            example: 2,
          },
        },
      },
      
      // Design Schemas
      Design: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          title: {
            type: 'string',
            example: 'Traditional Agbada',
          },
          description: {
            type: 'string',
            example: 'Elegant traditional Nigerian attire with intricate embroidery',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['https://res.cloudinary.com/image1.jpg'],
          },
          priceRange: {
            type: 'object',
            properties: {
              min: {
                type: 'number',
                example: 30000,
              },
              max: {
                type: 'number',
                example: 80000,
              },
            },
          },
          category: {
            type: 'string',
            enum: ['NATIVE', 'CASUAL', 'FORMAL'],
            example: 'NATIVE',
          },
          minimumDeliveryTime: {
            type: 'number',
            example: 7,
            description: 'Minimum days required for delivery',
          },
          requiredMaterials: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Fabric', 'Thread', 'Buttons'],
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateDesignRequest: {
        type: 'object',
        required: ['title', 'description', 'category', 'priceRange', 'minimumDeliveryTime'],
        properties: {
          title: {
            type: 'string',
            example: 'Senator Wear',
          },
          description: {
            type: 'string',
            example: 'Modern senator style with contemporary design',
          },
          category: {
            type: 'string',
            enum: ['NATIVE', 'CASUAL', 'FORMAL'],
            example: 'FORMAL',
          },
          priceRange: {
            type: 'object',
            required: ['min', 'max'],
            properties: {
              min: {
                type: 'number',
                example: 25000,
              },
              max: {
                type: 'number',
                example: 50000,
              },
            },
          },
          minimumDeliveryTime: {
            type: 'number',
            example: 5,
          },
          requiredMaterials: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Fabric', 'Thread'],
          },
        },
      },
      UpdateDesignRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          category: {
            type: 'string',
            enum: ['NATIVE', 'CASUAL', 'FORMAL'],
          },
          priceRange: {
            type: 'object',
          },
          minimumDeliveryTime: {
            type: 'number',
          },
          requiredMaterials: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      
      // Guide Schemas
      Guide: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          title: {
            type: 'string',
            example: 'How to Measure Chest',
          },
          description: {
            type: 'string',
            example: 'Step by step guide to accurately measure chest size',
          },
          type: {
            type: 'string',
            example: 'VIDEO',
            description: 'Type of guide resource (VIDEO, PDF, IMAGE, etc.)',
          },
          resourceUrl: {
            type: 'string',
            example: 'https://youtube.com/watch?v=...',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateGuideRequest: {
        type: 'object',
        required: ['title', 'description', 'type', 'resourceUrl'],
        properties: {
          title: {
            type: 'string',
            example: 'Measuring Shoulder Width',
          },
          description: {
            type: 'string',
            example: 'Learn how to measure shoulder width correctly',
          },
          type: {
            type: 'string',
            example: 'VIDEO',
          },
          resourceUrl: {
            type: 'string',
            example: 'https://youtube.com/watch?v=abc123',
          },
        },
      },
      
      // Review Schemas
      Review: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          userId: {
            type: 'string',
            format: 'uuid',
          },
          bookingId: {
            type: 'string',
            format: 'uuid',
          },
          rating: {
            type: 'number',
            minimum: 1,
            maximum: 5,
            example: 5,
          },
          comment: {
            type: 'string',
            example: 'Excellent work! Very professional and timely.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateReviewRequest: {
        type: 'object',
        required: ['rating', 'comment'],
        properties: {
          rating: {
            type: 'number',
            minimum: 1,
            maximum: 5,
            example: 5,
          },
          comment: {
            type: 'string',
            example: 'Amazing service and quality!',
          },
        },
      },
      
      // Admin Schemas
      AdminStats: {
        type: 'object',
        properties: {
          totalClients: {
            type: 'number',
            example: 50,
          },
          totalBookings: {
            type: 'number',
            example: 120,
          },
          totalRevenue: {
            type: 'number',
            example: 5000000,
          },
          pendingBookings: {
            type: 'number',
            example: 15,
          },
          completedBookings: {
            type: 'number',
            example: 85,
          },
        },
      },
      
      // Health Schema
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          uptime: {
            type: 'number',
            example: 3600,
            description: 'Server uptime in seconds',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Unauthorized access',
              statusCode: 401,
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User does not have required permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Forbidden - Admin access required',
              statusCode: 403,
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Resource not found',
              statusCode: 404,
            },
          },
        },
      },
      ValidationError: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Internal server error',
              statusCode: 500,
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/swagger/*.yaml', './src/routes/**/*.ts'], // Path to API docs
};

export const swaggerSpec = swaggerJSDoc(options);
