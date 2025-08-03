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



