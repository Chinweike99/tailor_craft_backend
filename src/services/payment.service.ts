import { PrismaClient, PaymentStatus } from '@prisma/client';
import Paystack from 'paystack';
import config from '../config/config';
import { BadRequestError, NotFoundError } from '../utils/error.utils';
import { sendEmail } from '../utils/helpers.utils';



const prisma = new PrismaClient();
const paystack = Paystack(config.paystack.secretKey);


export const initalizePayment = async(userId: string, bookingId: string, amount: number, isInstallment: boolean) => {
    const booking = await prisma.booking.findUnique({
        where: {id: bookingId, userId},
        include: {User: true}
    })

    if(!booking){
        throw new NotFoundError("InitializePayment: Not Found Error")
    }

    if(booking.status !== "APPROVED") {
        throw new BadRequestError("Booking must be approved before payment can be made")
    };

    if(booking.paymentStatus === "SUCCESS"){
        throw new BadRequestError("Booking already paid")
    }
    const payment = await prisma.payment.create({
        data: {
      userId,
      bookingId,
      amount,
      status: 'UNPAID',
      isInstallment,
    },
    });

    const response = await paystack.transaction.initialize({
        name: booking.User.name,
        email: booking.User?.email,
        amount: amount * 100,
        reference: payment.id,
        metadata: {
            bookingId,
            userId,
            isInstallment
        }
    });

    if (!response.status) {
    throw new Error('Payment initialization failed');
  }

  await prisma.payment.update({
    where: {id: payment.id},
    data:{
        paymentReference: response.data.reference,
        paymentUrl: response.data.authorization_url
    }
  });

  sendEmail({
  to: booking.User.email,
  subject: "Payment Confirmation for Your Booking",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4CAF50;">Payment Successful</h2>
      <p>Dear ${booking.User.name},</p>
      <p>We’re pleased to inform you that your payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${booking.id}</strong> has been successfully processed.</p>
      <p>Thank you for choosing our services. We look forward to delivering your design with elegance and excellence.</p>
      <p style="margin-top: 20px;">Best regards,<br/>The TailorCraft Team</p>
    </div>
  `
});

  sendEmail({
  to: config.admin.email,
  subject: "Client Payment Received",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2196F3;">New Payment Notification</h2>
      <p><strong>${booking.User.name}</strong> has successfully made a payment of <strong>₦${payment.amount}</strong> for booking ID <strong>${booking.id}</strong>.</p>
      <p>Please log in to the admin panel for more details.</p>
      <p style="margin-top: 20px;">Regards,<br/>TailorCraft Automated System</p>
    </div>
  `
});

  return {
    paymentUrl: response.data?.authorization_url,
    reference: payment.id
  }
}


export const verifyPayment = async(reference: string) => {
  const response = await paystack.transaction.verify(reference);

  if (!response.status) {
    throw new Error("Payment verification failed");
  }

  const payment = await prisma.payment.findFirst({
    where: { paymentReference: reference },
    include: {
      Booking: true,
      User: true,
    },
  });

  if (!payment) throw new NotFoundError("Payment not found");

  if (payment.status === "SUCCESS") return payment;

  let bookingUpdateData = {};
  let paymentStatus: PaymentStatus = "SUCCESS";

  if (payment.isInstallment) {
    const totalPaid = await prisma.payment.aggregate({
      where: { bookingId: payment.bookingId, status: "SUCCESS" },
      _sum: { amount: true },
    });

    const totalAmount = payment.Booking.totalAmount || 0;
    const paidAmount = (totalPaid._sum.amount || 0) + payment.amount;

    if (paidAmount >= totalAmount * 0.6 && paidAmount < totalAmount) {
      paymentStatus = "PARTIAL";
      bookingUpdateData = { paymentStatus: "60$_PAID" };
    } else if (paidAmount >= totalAmount) {
      paymentStatus = "SUCCESS";
      bookingUpdateData = { paymentStatus: "PAID" };
    }
  } else {
    bookingUpdateData = { paymentStatus: "PAID" };
  }

  const [updatedPayment, updatedBooking] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: paymentStatus },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: bookingUpdateData,
    }),
  ]);

  // ✅ Send email to client
  await sendEmail({
    to: payment.User.email,
    subject: "Payment Confirmation",
    html: `
      <p>Hi ${payment.User.name},</p>
      <p>Your payment of <strong>₦${payment.amount}</strong> for booking <strong>#${payment.Booking.id}</strong> has been successfully processed.</p>
      <p>Thank you for choosing us!</p>
    `,
  });

  // ✅ Send email to admin
  await sendEmail({
    to: config.admin.email,
    subject: "Client Payment Notification",
    html: `
      <p><strong>${payment.User.name}</strong> has made a payment of <strong>₦${payment.amount}</strong> for booking <strong>#${payment.Booking.id}</strong>.</p>
      <p>Please check the admin dashboard for details.</p>
    `,
  });

  return updatedPayment;
};






