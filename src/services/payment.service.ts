// import { PrismaClient, PaymentStatus } from '@prisma/client';
// import Paystack from 'paystack';
// import config from '../config/config';
// import { BadRequestError, NotFoundError } from '../utils/error.utils';
// import { sendEmail } from '../utils/helpers.utils';
// import { v4 as uuidv4 } from 'uuid';

// const prisma = new PrismaClient();
// const paystack = Paystack(config.paystack.secretKey);

// export const initalizePayment = async(userId: string, bookingId: string, amount: number, isInstallment: boolean) => {
//   if (!bookingId) {
//     throw new BadRequestError("Booking ID is required");
//   }
  
//   if (!userId) {
//     throw new BadRequestError("User ID is required");
//   }

//   const booking = await prisma.booking.findFirst({
//     where: {id: bookingId, userId},
//     include: {User: true}
//   });

//   if(!booking){
//     throw new NotFoundError("InitializePayment: Not Found Error")
//   }

//   if(booking.status !== "APPROVED") {
//     throw new BadRequestError("Booking must be approved before payment can be made")
//   }

//   if(booking.paymentStatus === "SUCCESS"){
//     throw new BadRequestError("Booking already paid")
//   }

//   // Generate unique reference for each payment
//   const generatedReference = `TC_${uuidv4()}_${Date.now()}`;

//   const payment = await prisma.payment.create({
//     data: {
//       userId,
//       bookingId,
//       amount,
//       status: 'UNPAID',
//       isInstallment,
//       paymentReference: generatedReference, // Store reference immediately
//     },
//   });

//   try {
//     const response = await paystack.transaction.initialize({
//       name: booking.User.name,
//       email: booking.User?.email,
//       amount: amount * 100,
//       reference: generatedReference,
//       metadata: {
//         bookingId,
//         userId,
//         paymentId: payment.id,
//         isInstallment: isInstallment.toString()
//       }
//     });

//     if (!response.status) {
//       throw new Error('Payment initialization failed');
//     }

//     // Update payment with URL
//     await prisma.payment.update({
//       where: {id: payment.id},
//       data: {
//         paymentUrl: response.data.authorization_url
//       }
//     });

//     return {
//       paymentUrl: response.data?.authorization_url,
//       reference: generatedReference,
//       paymentId: payment.id
//     };

//   } catch (error) {
//     // Clean up payment record if initialization fails
//     await prisma.payment.delete({
//       where: { id: payment.id }
//     });
//     throw error;
//   }
// };



// export const verifyPayment = async(reference: string) => {
//   try {
//     const payment = await prisma.payment.findFirst({
//       where: { paymentReference: reference },
//       include: {
//         Booking: true,
//         User: true,
//       },
//     });

//     if (!payment) {
//       throw new NotFoundError("Payment not found in database");
//     }

//     // If already successful, return early
//     if (payment.status === "SUCCESS") {
//       return payment;
//     }

//     // Verify with Paystack
//     const response = await paystack.transaction.verify(reference);

//     if (!response.status || !response.data) {
//       throw new Error("Payment verification failed with Paystack");
//     }

//     const paystackData = response.data;

//     // Check if payment was successful on Paystack's end
//     // if (paystackData.status !== 'success') {
//     //   throw new Error(`Payment failed: ${paystackData.gateway_response || 'Unknown error'}`);
//     // }

//     console.log("Paystack response:", paystackData);

//     if (paystackData.status !== 'success') {
//   return {
//     success: false,
//     message: `Payment not successful: ${paystackData.gateway_response || paystackData.status}`,
//     status: paystackData.status,
//     reference,
//   };
// }

// console.log("Paystack response:", paystackData);


//     // Verify amount matches (convert from kobo to naira)
//     const paystackAmount = paystackData.amount / 100;
//     if (paystackAmount !== payment.amount) {
//       throw new Error(`Amount mismatch: Expected ${payment.amount}, got ${paystackAmount}`);
//     }

//     let bookingUpdateData = {};
//     let paymentStatus: PaymentStatus = "SUCCESS";

//     if (payment.isInstallment) {
//       const totalPaid = await prisma.payment.aggregate({
//         where: { 
//           bookingId: payment.bookingId, 
//           status: "SUCCESS",
//           id: { not: payment.id } // Exclude current payment
//         },
//         _sum: { amount: true },
//       });

//       const totalAmount = payment.Booking.totalAmount || 0;
//       const paidAmount = (totalPaid._sum.amount || 0) + payment.amount;

//       if (paidAmount >= totalAmount * 0.6 && paidAmount < totalAmount) {
//         paymentStatus = "PARTIAL";
//         bookingUpdateData = { paymentStatus: "PARTIAL" }; // Use PARTIAL instead of "60$_PAID"
//       } else if (paidAmount >= totalAmount) {
//         paymentStatus = "SUCCESS";
//         bookingUpdateData = { paymentStatus: "SUCCESS" }; // Use SUCCESS instead of "PAID"
//       }
//     } else {
//       bookingUpdateData = { paymentStatus: "SUCCESS" }; // Use SUCCESS instead of "PAID"
//     }

//     const [updatedPayment, updatedBooking] = await prisma.$transaction([
//       prisma.payment.update({
//         where: { id: payment.id },
//         data: { 
//           status: paymentStatus, // This is correct - Payment model uses 'status'
//           updatedAt: new Date()
//         },
//       }),
//       prisma.booking.update({
//         where: { id: payment.bookingId },
//         data: {
//           ...bookingUpdateData, // This updates 'paymentStatus' on Booking model
//           updatedAt: new Date()
//         },
//       }),
//     ]);

//     // Send confirmation emails
//     await Promise.allSettled([
//       sendEmail({
//         to: payment.User.email,
//         subject: "Payment Confirmation for Your Booking",
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <h2 style="color: #4CAF50;">Payment Successful</h2>
//             <p>Dear ${payment.User.name},</p>
//             <p>We're pleased to inform you that your payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong> has been successfully processed.</p>
//             <p>Reference: <strong>${reference}</strong></p>
//             <p>Thank you for choosing our services. We look forward to delivering your design with elegance and excellence.</p>
//             <p style="margin-top: 20px;">Best regards,<br/>The TailorCraft Team</p>
//           </div>
//         `
//       }),
//       sendEmail({
//         to: config.admin.email,
//         subject: "Client Payment Received",
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <h2 style="color: #2196F3;">New Payment Notification</h2>
//             <p><strong>${payment.User.name}</strong> has successfully made a payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong>.</p>
//             <p>Reference: <strong>${reference}</strong></p>
//             <p>Please log in to the admin panel for more details.</p>
//             <p style="margin-top: 20px;">Regards,<br/>TailorCraft Automated System</p>
//           </div>
//         `
//       })
//     ]);

//     return updatedPayment;

//   } catch (error) {
//     console.error('Payment verification error:', error);
    
//     // If it's a Paystack API error, provide more context
//     // if (error.message?.includes('Resource declaration error')) {
//     //   throw new BadRequestError(`Payment verification failed: The payment reference "${reference}" was not found or is invalid. Please ensure the payment was completed successfully.`);
//     // }
    
//     throw error;
//   }
// };

// export const handleWebHook = async(payload: any) => {
//   try {
//     const event = payload.event;
//     const data = payload.data;

//     // Fix typo: charge.success not charge.sucess
//     if (event === 'charge.success') {
//       await verifyPayment(data.reference);
//     }
    
//     return { success: true };
//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     // return { success: false, error: error.message };
//   }
// };

// export const getPaymentHistory = async (userId: string) => {
//   const payments = await prisma.payment.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     include: { 
//       Booking: {
//         select: {
//           id: true,
//           status: true,
//           paymentStatus: true,
//           totalAmount: true,
//           deliveryDate: true
//         }
//       }
//     },
//   });

//   return payments;
// };



















// import { PrismaClient, PaymentStatus } from '@prisma/client';
// import Paystack from 'paystack-api';
// import config from '../config/config';
// import { BadRequestError, NotFoundError } from '../utils/error.utils';
// import { sendEmail } from '../utils/helpers.utils';
// import { v4 as uuidv4 } from 'uuid';
// import crypto from 'crypto';

// const prisma = new PrismaClient();
// const paystack = Paystack(config.paystack.secretKey);

// // Create transfer recipient for admin account
// export const createTransferRecipient = async () => {
//   try {
//     const response = await paystack.transferrecipient.create({
//       type: "nuban",
//       name: config.admin.accountName, 
//       account_number: config.admin.accountNumber,
//       bank_code: config.admin.bankCode,
//       currency: "NGN"
//     });
    
//     return response.data.recipient_code;
//   } catch (error) {
//     console.error('Error creating transfer recipient:', error);
//     throw error;
//   }
// };

// export const initalizePayment = async(userId: string, bookingId: string, amount: number, isInstallment: boolean) => {
//   if (!bookingId) {
//     throw new BadRequestError("Booking ID is required");
//   }
  
//   if (!userId) {
//     throw new BadRequestError("User ID is required");
//   }

//   const booking = await prisma.booking.findFirst({
//     where: {id: bookingId, userId},
//     include: {User: true}
//   });

//   if(!booking){
//     throw new NotFoundError("InitializePayment: Not Found Error")
//   }

//   if(booking.status !== "APPROVED") {
//     throw new BadRequestError("Booking must be approved before payment can be made")
//   }

//   if(booking.paymentStatus === "SUCCESS"){
//     throw new BadRequestError("Booking already paid")
//   }

//   // Generate unique reference for each payment
//   const generatedReference = `TC_${uuidv4()}_${Date.now()}`;

//   const payment = await prisma.payment.create({
//     data: {
//       userId,
//       bookingId,
//       amount,
//       status: 'UNPAID',
//       isInstallment,
//       paymentReference: generatedReference,
//     },
//   });

//   try {
//     const response = await paystack.transaction.initialize({
//       name: booking.User.name,
//       email: booking.User?.email,
//       amount: amount * 100,
//       reference: generatedReference,
//       // Add subaccount or split payment configuration here if needed
//       metadata: {
//         bookingId,
//         userId,
//         paymentId: payment.id,
//         isInstallment: isInstallment.toString()
//       },
//       // Add callback URL for better handling
//       // callback_url: `${config.frontend.url}/payment/callback?reference=${generatedReference}` // WHEN FRONTEND IS READY
//       callback_url: `http://localhost:4000/payment/callback?reference=${generatedReference}`
//     });

//     if (!response.status) {
//       throw new Error('Payment initialization failed');
//     }

//     // Update payment with URL
//     await prisma.payment.update({
//       where: {id: payment.id},
//       data: {
//         paymentUrl: response.data.authorization_url
//       }
//     });

//     return {
//       paymentUrl: response.data?.authorization_url,
//       reference: generatedReference,
//       paymentId: payment.id
//     };

//   } catch (error) {
//     // Clean up payment record if initialization fails
//     await prisma.payment.delete({
//       where: { id: payment.id }
//     });
//     throw error;
//   }
// };

// // Transfer funds to admin account
// export const transferToAdmin = async (amount: number, reference: string, reason: string = "Payment settlement") => {
//   try {
//     // Create recipient if not exists (you might want to store this in your config/database)
//     const recipientCode = await createTransferRecipient();
    
//     const transferResponse = await paystack.transfer.create({
//       source: "balance",
//       amount: amount * 100, // Convert to kobo
//       recipient: recipientCode,
//       reason: reason,
//       reference: `TRANSFER_${reference}_${Date.now()}`
//     });

//     return transferResponse.data;
//   } catch (error) {
//     console.error('Transfer error:', error);
//     throw error;
//   }
// };

// export const verifyPayment = async(reference: string) => {
//   try {
//     const payment = await prisma.payment.findFirst({
//       where: { paymentReference: reference },
//       include: {
//         Booking: true,
//         User: true,
//       },
//     });

//     if (!payment) {
//       throw new NotFoundError("Payment not found in database");
//     }

//     // If already successful, return early
//     if (payment.status === "SUCCESS") {
//       return {
//         success: true,
//         message: "Payment already verified",
//         payment,
//         status: "success",
//         reference
//       };
//     }

//     // Verify with Paystack
//     const response = await paystack.transaction.verify(reference);

//     if (!response.status || !response.data) {
//       throw new Error("Payment verification failed with Paystack");
//     }

//     const paystackData = response.data;
//     console.log("Paystack response:", paystackData);

//     // Handle different payment statuses
//     if (paystackData.status !== 'success') {
//       // Update payment status based on Paystack status
//       let dbStatus: PaymentStatus = "UNPAID";
//       if (paystackData.status === 'failed') {
//         dbStatus = "UNPAID";
//       }
//       // You might want to add more status mappings here

//       await prisma.payment.update({
//         where: { id: payment.id },
//         data: { 
//           status: dbStatus,
//           updatedAt: new Date()
//         },
//       });

//       return {
//         success: false,
//         message: `Payment not successful: ${paystackData.gateway_response || paystackData.status}`,
//         status: paystackData.status,
//         reference,
//       };
//     }

//     // Verify amount matches (convert from kobo to naira)
//     const paystackAmount = paystackData.amount / 100;
//     if (paystackAmount !== payment.amount) {
//       throw new Error(`Amount mismatch: Expected ${payment.amount}, got ${paystackAmount}`);
//     }

//     let bookingUpdateData = {};
//     let paymentStatus: PaymentStatus = "SUCCESS";

//     if (payment.isInstallment) {
//       const totalPaid = await prisma.payment.aggregate({
//         where: { 
//           bookingId: payment.bookingId, 
//           status: "SUCCESS",
//           id: { not: payment.id }
//         },
//         _sum: { amount: true },
//       });

//       const totalAmount = payment.Booking.totalAmount || 0;
//       const paidAmount = (totalPaid._sum.amount || 0) + payment.amount;

//       if (paidAmount >= totalAmount * 0.6 && paidAmount < totalAmount) {
//         paymentStatus = "PARTIAL";
//         bookingUpdateData = { paymentStatus: "PARTIAL" };
//       } else if (paidAmount >= totalAmount) {
//         paymentStatus = "SUCCESS";
//         bookingUpdateData = { paymentStatus: "SUCCESS" };
//       }
//     } else {
//       bookingUpdateData = { paymentStatus: "SUCCESS" };
//     }

//     const [updatedPayment, updatedBooking] = await prisma.$transaction([
//       prisma.payment.update({
//         where: { id: payment.id },
//         data: { 
//           status: paymentStatus,
//           updatedAt: new Date()
//         },
//       }),
//       prisma.booking.update({
//         where: { id: payment.bookingId },
//         data: {
//           ...bookingUpdateData,
//           updatedAt: new Date()
//         },
//       }),
//     ]);

//     // Transfer funds to admin account (only in live mode)
//     if (process.env.NODE_ENV === 'production' && config.paystack.isLive) {
//       try {
//         await transferToAdmin(payment.amount, reference, `Settlement for booking ${payment.bookingId}`);
//       } catch (transferError) {
//         console.error('Transfer to admin failed:', transferError);
//         // Don't fail the payment verification if transfer fails
//         // You might want to implement a retry mechanism or manual transfer process
//       }
//     }

//     // Send confirmation emails
//     await Promise.allSettled([
//       sendEmail({
//         to: payment.User.email,
//         subject: "Payment Confirmation for Your Booking",
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <h2 style="color: #4CAF50;">Payment Successful</h2>
//             <p>Dear ${payment.User.name},</p>
//             <p>We're pleased to inform you that your payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong> has been successfully processed.</p>
//             <p>Reference: <strong>${reference}</strong></p>
//             <p>Thank you for choosing our services. We look forward to delivering your design with elegance and excellence.</p>
//             <p style="margin-top: 20px;">Best regards,<br/>The TailorCraft Team</p>
//           </div>
//         `
//       }),
//       sendEmail({
//         to: config.admin.email,
//         subject: "Client Payment Received",
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333;">
//             <h2 style="color: #2196F3;">New Payment Notification</h2>
//             <p><strong>${payment.User.name}</strong> has successfully made a payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${payment.Booking.id}</strong>.</p>
//             <p>Reference: <strong>${reference}</strong></p>
//             <p>Please log in to the admin panel for more details.</p>
//             <p style="margin-top: 20px;">Regards,<br/>TailorCraft Automated System</p>
//           </div>
//         `
//       })
//     ]);

//     return {
//       success: true,
//       message: "Payment verified successfully",
//       payment: updatedPayment,
//       booking: updatedBooking,
//       status: "success",
//       reference
//     };

//   } catch (error) {
//     console.error('Payment verification error:', error);
//     throw error;
//   }
// };

// // Verify webhook signature for security
// export const verifyWebhookSignature = (payload: string, signature: string): boolean => {
//   const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(payload).digest('hex');
//   return hash === signature;
// };

// export const handleWebHook = async(req: any) => {
//   try {
//     const payload = JSON.stringify(req.body);
//     const signature = req.headers['x-paystack-signature'];

//     // Verify webhook signature for security
//     if (!verifyWebhookSignature(payload, signature)) {
//       console.error('Invalid webhook signature');
//       return { success: false, error: 'Invalid signature' };
//     }

//     const event = req.body.event;
//     const data = req.body.data;

//     console.log('Webhook event:', event);

//     if (event === 'charge.success') {
//       await verifyPayment(data.reference);
//     }
    
//     // Handle transfer events if needed
//     if (event === 'transfer.success' || event === 'transfer.failed') {
//       console.log('Transfer event:', event, data);
//       // You can implement transfer tracking here
//     }
    
//     return { success: true };
//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     return { success: false, error: error.message };
//   }
// };

// // Get payment history for clients
// export const getPaymentHistory = async (userId: string) => {
//   const payments = await prisma.payment.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     include: { 
//       Booking: {
//         select: {
//           id: true,
//           status: true,
//           paymentStatus: true,
//           totalAmount: true,
//           deliveryDate: true
//         }
//       },
//       User: {
//         select: {
//           id: true,
//           name: true,
//           email: true
//         }
//       }
//     },
//   });

//   return payments;
// };

// // Get all payments for admin
// export const getAllPayments = async (page: number = 1, limit: number = 20) => {
//   const skip = (page - 1) * limit;
  
//   const [payments, total] = await Promise.all([
//     prisma.payment.findMany({
//       skip,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       include: { 
//         Booking: {
//           select: {
//             id: true,
//             status: true,
//             paymentStatus: true,
//             totalAmount: true,
//             deliveryDate: true
//           }
//         },
//         User: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phone: true
//           }
//         }
//       },
//     }),
//     prisma.payment.count()
//   ]);

//   return {
//     payments,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   };
// };

// // Get payment statistics for admin dashboard
// export const getPaymentStats = async () => {
//   const [totalPayments, successfulPayments, totalRevenue, recentPayments] = await Promise.all([
//     prisma.payment.count(),
//     prisma.payment.count({ where: { status: 'SUCCESS' } }),
//     prisma.payment.aggregate({
//       where: { status: 'SUCCESS' },
//       _sum: { amount: true }
//     }),
//     prisma.payment.findMany({
//       take: 5,
//       orderBy: { createdAt: 'desc' },
//       where: { status: 'SUCCESS' },
//       include: {
//         User: {
//           select: { name: true, email: true }
//         },
//         Booking: {
//           select: { id: true }
//         }
//       }
//     })
//   ]);

//   return {
//     totalPayments,
//     successfulPayments,
//     totalRevenue: totalRevenue._sum.amount || 0,
//     recentPayments
//   };
// };




















import { PrismaClient, PaymentStatus } from '@prisma/client';
import config from '../config/config';
import { BadRequestError, NotFoundError } from '../utils/error.utils';
import { sendEmail } from '../utils/helpers.utils';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import PaystackService from '../utils/paystack.utils';

const prisma = new PrismaClient();


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
export const getAllPayments = async (page: number = 1, limit: number = 20) => {
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