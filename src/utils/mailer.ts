import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { EmailType } from './enums';
import { EMAIL_TEMPLATES } from './templates/emailTemplates';

dotenv.config();

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD
    }
});

interface SendEmailParams {
    to: string;
    templateType: EmailType;
    payload: { [key: string]: any };
}

export const sendEmail = async ({ to, templateType, payload }: SendEmailParams): Promise<void> => {
    try {
        const template = EMAIL_TEMPLATES(payload, templateType);

        const mailOptions = {
            from: `"Rentify" <${process.env.MAIL_USER}>`,
            to,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        console.log('Recipient:', to);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send email');
    }
};