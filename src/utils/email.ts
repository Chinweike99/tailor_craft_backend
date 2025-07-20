import dotenv from 'dotenv';
dotenv.config();
import sgMail from '@sendgrid/mail';

interface SendEmailOptions {
    email: string;
    subject: string;
    html: string
}

sgMail.setApiKey(process.env.MAIL_API!);

export const SendEmail = async(options: SendEmailOptions) => {
    try {
        const msg = {
            to: options.email,
            from: `TailorCraft <${process.env.EMAIL_FROM}>`,
            subject: options.subject,
            html: options.html
        };

        const result  = await sgMail.send(msg);
        console.log("Email sent successfull: ", result[0].statusCode);
        return result;


    } catch (error) {
        console.error("Email sending failed", error);
        throw Error
    }
}
