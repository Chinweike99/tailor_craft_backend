import { PaymentStatus } from '@prisma/client';
import config from '../config/config';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/error.utils';
import { sendEmail } from '../utils/helpers.utils';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import PaystackService from '../utils/paystack.utils';


// Create transfer recipient for admin account
export const createTransferRecipient = async (): Promise<string> => {
  try {
    const recipientData = {
      type: "nuban",
      name: config.admin.accountName,
      account_number: config.admin.accountNumber,
      bank_code: config.admin.bankCode,
      currency: "NGN"
    };

    const recipient = await PaystackService.createTransferRecipient(recipientData);
    return recipient.recipient_code;
  } catch (error: any) {
    console.error('Error creating transfer recipient:', error.message);
    throw new Error(`Transfer recipient creation failed: ${error.message}`);
  }
};

export const initalizePayment = async(userId: string, bookingId: string, amount: number, isInstallment: boolean) => {
  if (!bookingId) {
    throw new BadRequestError("Booking ID is required");
  }
  
  if (!userId) {
    throw new BadRequestError("User ID is required");
  }

  const booking = await prisma.booking.findFirst({
    where: {id: bookingId, userId},
    include: {User: true}
  });

  if(!booking){
    throw new NotFoundError("InitializePayment: Not Found Error")
  }

  if(booking.status !== "APPROVED") {
    throw new BadRequestError("Booking must be approved before payment can be made")
  }

  if(booking.paymentStatus === "SUCCESS"){
    throw new BadRequestError("Booking already paid")
  }

  // Generate unique reference for each payment
  const generatedReference = `TC_${uuidv4()}_${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      bookingId,
      amount,
      status: 'UNPAID',
      isInstallment,
      paymentReference: generatedReference,
    },
  });

  try {
    const transactionData = {
      name: booking.User.name,
      email: booking.User?.email,
      amount: amount * 100,
      reference: generatedReference,
      metadata: {
        bookingId,
        userId,
        paymentId: payment.id,
        isInstallment: isInstallment.toString()
      },
      // callback_url: `${config.frontend.url}/payment/callback?reference=${generatedReference}` WHEN FRONTEND IS ADDED
      callback_url: `http://localhost:4000/payment/callback?reference=${generatedReference}`
    };
    console.log("This is your transactions data:", transactionData)

    const response = await PaystackService.initializeTransaction(transactionData);

    // Update payment with URL
    await prisma.payment.update({
      where: {id: payment.id},
      data: {
        paymentUrl: response.authorization_url
      }
    });

    return {
      paymentUrl: response.authorization_url,
      reference: generatedReference,
      paymentId: payment.id
    };

  } catch (error) {
    // Clean up payment record if initialization fails
    await prisma.payment.delete({
      where: { id: payment.id }
    });
    throw error;
  }
};

export const transferToAdmin = async (amount: number, reference: string, reason: string = "Payment settlement") => {
  try {
    // Create recipient if not exists (you might want to store this in your config/database)
    const recipientCode = await createTransferRecipient();
    
    const transferData = {
      source: "balance",
      amount: amount * 100, // Convert to kobo
      recipient: recipientCode,
      reason: reason,
      reference: `TRANSFER_${reference}_${Date.now()}`
    };

    const transferResult = await PaystackService.createTransfer(transferData);
    return transferResult;
  } catch (error: any) {
    console.error('Transfer error:', error.message);
    throw new Error(`Transfer failed: ${error.message}`);
  }
};

export const verifyPayment = async(reference: string) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { paymentReference: reference },
      include: {
        Booking: true,
        User: true,
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found in database");
    }

    // If already successful, return early
    if (payment.status === "SUCCESS") {
      return {
        success: true,
        message: "Payment already verified",
        payment,
        status: "success",
        reference
      };
    }

    // Verify with Paystack
    const paystackData = await PaystackService.verifyTransaction(reference);
    console.log("Paystack response:", paystackData);

    // Handle different payment statuses
    if (paystackData.status !== 'success') {
      // Update payment status based on Paystack status
      let dbStatus: PaymentStatus = "UNPAID";
      if (paystackData.status === 'success') {
      dbStatus = "SUCCESS";
    } else if (paystackData.status === 'failed') {
      dbStatus = "UNPAID";
    } else if (paystackData.status === 'abandoned') {
      dbStatus = "UNPAID";
    } else if (paystackData.status === 'pending') {
      dbStatus = "PENDING";
    } else if (paystackData.status === 'reversed') {
      dbStatus = "REFUNDED";
    } else if (paystackData.status === 'processing') {
      dbStatus = "PROCESSING";
    } else {
      dbStatus = "UNPAID";
    }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: dbStatus,
          updatedAt: new Date()
        },
      });

      return {
        success: false,
        message: `Payment not successful: ${paystackData.gateway_response || paystackData.status}`,
        status: paystackData.status,
        reference,
      };
    }

    // Verify amount matches (convert from kobo to naira)
    const paystackAmount = paystackData.amount / 100;
    if (paystackAmount !== payment.amount) {
      throw new Error(`Amount mismatch: Expected ${payment.amount}, got ${paystackAmount}`);
    }

    let bookingUpdateData = {};
    let paymentStatus: PaymentStatus = "SUCCESS";

    if (payment.isInstallment) {
      const totalPaid = await prisma.payment.aggregate({
        where: { 
          bookingId: payment.bookingId, 
          status: "SUCCESS",
          id: { not: payment.id }
        },
        _sum: { amount: true },
      });

      const totalAmount = payment.Booking.totalAmount || 0;
      const paidAmount = (totalPaid._sum.amount || 0) + payment.amount;

      if (paidAmount >= totalAmount * 0.6 && paidAmount < totalAmount) {
        paymentStatus = "PARTIAL";
        bookingUpdateData = { paymentStatus: "PARTIAL" };
      } else if (paidAmount >= totalAmount) {
        paymentStatus = "SUCCESS";
        bookingUpdateData = { paymentStatus: "SUCCESS" };
      }
    } else {
      bookingUpdateData = { paymentStatus: "SUCCESS" };
    }

    const [updatedPayment, updatedBooking] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: paymentStatus,
          updatedAt: new Date()
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          ...bookingUpdateData,
          updatedAt: new Date()
        },
      }),
    ]);

    // Transfer funds to admin account (only in live mode)
    if (process.env.NODE_ENV === 'production' && config.paystack.isLive) {
      try {
        await transferToAdmin(payment.amount, reference, `Settlement for booking ${payment.bookingId}`);
      } catch (transferError) {
        console.error('Transfer to admin failed:', transferError);
        // Don't fail the payment verification if transfer fails
        // You might want to implement a retry mechanism or manual transfer process
      }
    }

    // Send confirmation emails
    await Promise.allSettled([
      sendEmail({
        to: payment.User.email,
        subject: "Payment Confirmation for Your Booking",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4CAF50;">Payment Successful</h2>
            <p>Dear ${payment.User.name},</p>
            <p>We're pleased to inform you that your payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong> has been successfully processed.</p>
            <p>Reference: <strong>${reference}</strong></p>
            <p>Thank you for choosing our services. We look forward to delivering your design with elegance and excellence.</p>
            <p style="margin-top: 20px;">Best regards,<br/>The TailorCraft Team</p>
          </div>
        `
      }),
      sendEmail({
        to: config.admin.email,
        subject: "Client Payment Received",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2196F3;">New Payment Notification</h2>
            <p><strong>${payment.User.name}</strong> has successfully made a payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong>.</p>
            <p>Reference: <strong>${reference}</strong></p>
            <p>Please log in to the admin panel for more details.</p>
            <p style="margin-top: 20px;">Regards,<br/>TailorCraft Automated System</p>
          </div>
        `
      })
    ]);

    return {
      success: true,
      message: "Payment verified successfully",
      payment: updatedPayment,
      booking: updatedBooking,
      status: "success",
      reference
    };

  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// Verify webhook signature for security
export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(payload).digest('hex');
  return hash === signature;
};

export const handleWebHook = async(req: any) => {
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-paystack-signature'];

    // Verify webhook signature for security
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return { success: false, error: 'Invalid signature' };
    }

    const event = req.body.event;
    const data = req.body.data;

    console.log('Webhook event:', event);

    if (event === 'charge.success') {
      await verifyPayment(data.reference);
    }
    
    // Handle transfer events if needed
    if (event === 'transfer.success' || event === 'transfer.failed') {
      console.log('Transfer event:', event, data);
      // You can implement transfer tracking here
    }
    
    return { success: true };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { success: false, error: error };
  }
};

// Get payment history for clients
export const getPaymentHistory = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { 
      Booking: {
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          deliveryDate: true
        }
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
  });

  return payments;
};

// Get all payments for admin
export const   getAllPayments = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { 
        Booking: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            deliveryDate: true
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
      },
    }),
    prisma.payment.count()
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get payment statistics for admin dashboard
export const getPaymentStats = async () => {
  const [totalPayments, successfulPayments, totalRevenue, recentPayments] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'SUCCESS' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'SUCCESS' },
      include: {
        User: {
          select: { name: true, email: true }
        },
        Booking: {
          select: { id: true }
        }
      }
    })
  ]);

  return {
    totalPayments,
    successfulPayments,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentPayments
  };
};




// Paystack test cards
export const TEST_CARDS = {
  SUCCESSFUL_CARD: {
    number: "4084084084084081",
    cvv: "408",
    expiry_month: "12",
    expiry_year: "2030"
  },
  INSUFFICIENT_FUNDS: {
    number: "4084084084084084",
    cvv: "408", 
    expiry_month: "12",
    expiry_year: "2030"
  },
  CARD_WITH_PIN: {
    number: "5060666666666666666",
    cvv: "123",
    expiry_month: "12", 
    expiry_year: "2030",
    pin: "1234" // Test PIN
  },
  INVALID_CARD: {
    number: "4084084084084002",
    cvv: "408",
    expiry_month: "12",
    expiry_year: "2030"
  },
  TIMEOUT_CARD: {
    number: "4084084084084003",
    cvv: "408",
    expiry_month: "12",
    expiry_year: "2030"
  }
};

interface TestPaymentData {
  userId: string;
  bookingId: string;
  amount: number;
  isInstallment: boolean;
  testCardType: keyof typeof TEST_CARDS;
}

export const processTestPayment = async (data: TestPaymentData) => {
  const { userId, bookingId, amount, isInstallment, testCardType } = data;

  // Validate booking
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { User: true }
  });

  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.status !== "APPROVED") {
    throw new BadRequestError("Booking must be approved before payment");
  }

  if (booking.paymentStatus === "SUCCESS") {
    throw new BadRequestError("Booking already paid");
  }

  // Generate unique reference
  const generatedReference = `TEST_${uuidv4()}_${Date.now()}`;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId,
      bookingId,
      amount,
      status: 'UNPAID',
      isInstallment,
      paymentReference: generatedReference,
    },
  });

  try {
    // Get test card details
    const testCard = TEST_CARDS[testCardType];
    if (!testCard) {
      throw new BadRequestError("Invalid test card type");
    }

    // Prepare charge data
    const chargeData = {
      email: booking.User.email,
      amount: amount * 100, // Convert to kobo
      card: {
        number: testCard.number,
        cvv: testCard.cvv,
        expiry_month: testCard.expiry_month,
        expiry_year: testCard.expiry_year
      },
      reference: generatedReference,
      metadata: {
        bookingId,
        userId,
        paymentId: payment.id,
        isInstallment: isInstallment.toString(),
        testCardType
      }
    };

    console.log("Charging test card:", { testCardType, reference: generatedReference });

    // Charge the card
    const chargeResponse = await PaystackService.chargeCard(chargeData);
    
    console.log("Charge response status:", chargeResponse.status);
    
    // Handle different charge responses
    if (chargeResponse.status === 'success') {
      // Payment successful immediately
      return await handleSuccessfulTestPayment(payment, chargeResponse);
    } else if (chargeResponse.status === 'send_pin') {
      // Card requires PIN (for cards with PIN)
      if (testCardType === 'CARD_WITH_PIN') {
        const pinResponse = await PaystackService.submitPin(
          chargeResponse.reference, 
          TEST_CARDS.CARD_WITH_PIN.pin!
        );
        
        if (pinResponse.status === 'success') {
          return await handleSuccessfulTestPayment(payment, pinResponse);
        } else {
          throw new Error(`PIN submission failed: ${pinResponse.gateway_response}`);
        }
      } else {
        throw new Error("Card requires PIN but no PIN provided");
      }
    } else if (chargeResponse.status === 'send_otp') {
      // For testing, we'll simulate OTP with a default value
      // In real testing, you might want to handle this differently
      const otpResponse = await PaystackService.submitOtp(
        chargeResponse.reference, 
        "123456" // Test OTP
      );
      
      if (otpResponse.status === 'success') {
        return await handleSuccessfulTestPayment(payment, otpResponse);
      } else {
        throw new Error(`OTP submission failed: ${otpResponse.gateway_response}`);
      }
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'UNPAID',
          updatedAt: new Date()
        }
      });

      return {
        success: false,
        message: `Test payment failed: ${chargeResponse.gateway_response}`,
        status: chargeResponse.status,
        reference: generatedReference,
        testCardType,
        paymentId: payment.id
      };
    }

  } catch (error: any) {
    console.error('Test payment error:', error);
    
    // Clean up payment record if charge fails
    await prisma.payment.delete({
      where: { id: payment.id }
    });
    
    throw new Error(`Test payment failed: ${error.message}`);
  }
};

async function handleSuccessfulTestPayment(payment: any, chargeResponse: any) {
  // Update payment and booking status
  let bookingUpdateData = {};
  let paymentStatus: PaymentStatus = "SUCCESS";

  if (payment.isInstallment) {
    const totalPaid = await prisma.payment.aggregate({
      where: { 
        bookingId: payment.bookingId, 
        status: "SUCCESS",
        id: { not: payment.id }
      },
      _sum: { amount: true },
    });

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId }
    });

    const totalAmount = booking?.totalAmount || 0;
    const paidAmount = (totalPaid._sum.amount || 0) + payment.amount;

    if (paidAmount >= totalAmount * 0.6 && paidAmount < totalAmount) {
      paymentStatus = "PARTIAL";
      bookingUpdateData = { paymentStatus: "PARTIAL" };
    } else if (paidAmount >= totalAmount) {
      paymentStatus = "SUCCESS";
      bookingUpdateData = { paymentStatus: "SUCCESS" };
    }
  } else {
    bookingUpdateData = { paymentStatus: "SUCCESS" };
  }

  const [updatedPayment, updatedBooking] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: paymentStatus,
        updatedAt: new Date()
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        ...bookingUpdateData,
        updatedAt: new Date()
      },
    }),
  ]);

  return {
    success: true,
    message: "Test payment successful",
    status: chargeResponse.status,
    reference: chargeResponse.reference,
    payment: updatedPayment,
    booking: updatedBooking,
    gateway_response: chargeResponse.gateway_response
  };
}








