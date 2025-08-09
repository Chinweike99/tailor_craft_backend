import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { 
  getPaymentHistory, 
  handleWebHook, 
  initalizePayment, 
  verifyPayment,
  getAllPayments,
  getPaymentStats,
  processTestPayment
} from '../services/payment.service';
import { NotFoundError, UnauthorizedError } from '../utils/error.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializePaymentSchema = z.object({
  amount: z.number().positive(),
  isInstallment: z.boolean().default(false),
});




const testPaymentSchema = z.object({
  amount: z.number().positive(),
  isInstallment: z.boolean().default(false),
  testCardType: z.enum(['SUCCESSFUL_CARD', 'INSUFFICIENT_FUNDS', 'CARD_WITH_PIN', 'INVALID_CARD', 'TIMEOUT_CARD'])
});

export const processTestPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only allow in test environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        status: "error",
        message: "Test payments are not allowed in production"
      });
    }

    const userId = req.user?.id;
    const bookingId = req.params.id;
    const { amount, isInstallment, testCardType } = testPaymentSchema.parse(req.body);

    if (!userId) {
      throw new NotFoundError("User not found");
    }

    const result = await processTestPayment({
      userId,
      bookingId,
      amount,
      isInstallment,
      testCardType
    });

    res.status(200).json({
      status: "success",
      data: result
    });
  } catch (error) {
    next(error);
  }
};







export const InitializePaymentController = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;
    const {amount, isInstallment} = initializePaymentSchema.parse(req.body);

    if(!userId){
      throw new NotFoundError("InitializePaymentController: Not Found Error")
    }

    const response = await initalizePayment(userId, bookingId, amount, isInstallment);
    res.status(201).json({
      status: "success",
      response
    })
  } catch (error) {
    next(error)
  }
};

export const verifyPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Verify Payment controller");
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    const result = await verifyPayment(reference as string);
    
    // Return consistent response format
    res.json({
      success: result.success,
      message: result.message,
      status: result.status,
      reference: result.reference,
      data: result.success ? {
        payment: result.payment,
        booking: result.booking
      } : null
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhookController = async (req: Request, res: Response) => {
  try {
    const result = await handleWebHook(req);
    res.status(200).json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
};

// Client payment history
export const getPaymentHistoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if(!userId){
      throw new NotFoundError("User Not Found")
    }
    const payments = await getPaymentHistory(userId);
    res.json({
      status: "success",
      data: payments
    });
  } catch (error) {
    next(error)
  }
};

// Admin: Get all payments with pagination
export const getAllPaymentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedError("Access denied. Admin only.");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllPayments(page, limit);
    
    res.json({
      status: "success",
      data: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get payment statistics
export const getPaymentStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedError("Access denied. Admin only.");
    }

    const stats = await getPaymentStats();
    
    res.json({
      status: "success",
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get single payment details (admin or payment owner)
export const getPaymentDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new NotFoundError("User not found");
    }

    // Build where clause based on user role
    const whereClause: any = { id: paymentId };
    if (userRole !== 'ADMIN') {
      // Non-admin users can only see their own payments
      whereClause.userId = userId;
    }

    const payment = await prisma.payment.findFirst({
      where: whereClause,
      include: {
        Booking: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            deliveryDate: true,
            notes: true
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    res.json({
      status: "success",
      data: payment
    });
  } catch (error) {
    next(error);
  }
};