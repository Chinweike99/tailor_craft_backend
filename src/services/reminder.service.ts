import cron from 'node-cron'
import config, { prisma } from '../config/config';
import { sendEmail } from '../utils/helpers.utils';
// import { SendEmail } from '../utils/email';


export const setUpDeliveryReminders = () => {
    // Check daily for bookings with delivery dates in 7, 4, and 1 days
    cron.schedule('10 9 * * *', async() => {
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const fourDaysLater = new Date(today);
        fourDaysLater.setDate(fourDaysLater.getDate() + 4);

        const oneDayLater = new Date(today);
        oneDayLater.setDate(oneDayLater.getDate() + 1);

        // Format dates to compare only date part (without time)
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Find bookings with delivery dates matching our targets
        const bookings = await prisma.booking.findMany({
            where: {
                status: "IN_PROGRESS",
                deliveryDate: {
                    in: [
                        formatDate(sevenDaysLater),
                        formatDate(fourDaysLater),
                        formatDate(oneDayLater),
                    ].map(date => new Date(date))
                }
            },
            include: {
                User: true,
                Design: true
            }
        })

        // Send reminders
        for (const booking of bookings){
            const deliveryDate = new Date(booking.deliveryDate);
            const diffInDays = Math.floor((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            let subject = '';
            let message = '';

            if(diffInDays === 7) {
                subject = '7-Day Delivery Reminder';
                message = `Your order for ${booking.Design?.title || 'custom design'} is due in 7 days.`;
            }else if (diffInDays === 4) {
                subject = '4-Day Delivery Reminder';
                message = `Your order for ${booking.Design?.title || 'custom design'} is due in 4 days.`;
            } else if (diffInDays === 1) {
                subject = '1-Day Delivery Reminder';
                message = `Your order for ${booking.Design?.title || 'custom design'} is due tomorrow.`;
            }

            if(subject && message) {
                await sendEmail({
                    to: booking.User.email,
                    subject,
                    html: message
                });

                await sendEmail({
                    to: config.admin.email,
                    subject: `${subject} — Client: ${booking.User.name}`,
                    html: `
                        <p>Client: <strong>${booking.User.name}</strong></p>
                        <p>Email: ${booking.User.email}</p>
                        <p>Design: <strong>${booking.Design?.title || 'custom design'}</strong></p>
                        <p>Delivery Date: ${booking.deliveryDate.toDateString()}</p>
                        <p>${message}</p>
                    `
                    });

                // Log the reminder
                await prisma.reminder.create({
                    data: {
                        bookingId: booking.id,
                        userId: booking.userId,
                        daysBefore: diffInDays,
                        sentAt: new Date()
                    }
                })

            }
        }
    })
}