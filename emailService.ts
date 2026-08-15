import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function sendPurchaseEmail(params: {
  email: string;
  name: string;
  planName: string;
  orderId: string;
  amount: number | string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    return false;
  }
  
  try {
    const data = await resend.emails.send({
      from: 'AutoListing <support@autolisting.online>',
      to: params.email,
      subject: `Your AutoListing Tool Access - Order ${params.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">Thank you for your purchase!</h2>
          <p>Hi ${params.name},</p>
          <p>Your payment for <strong>${params.planName}</strong> was successful.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Order Details:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Order ID: ${params.orderId}</li>
              <li>Amount Paid: ₹${params.amount}</li>
              <li>Plan: ${params.planName}</li>
            </ul>
          </div>
          
          <p>You can now access your tool from the dashboard or download it directly using the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://autolisting.online/download" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access AutoListing Tool</a>
          </div>
          
          <p>If you need any help, reply to this email at support@autolisting.online.</p>
          <p>Best regards,<br>The AutoListing Team</p>
        </div>
      `,
      headers: {
        'Idempotency-Key': `purchase_${params.orderId}`
      }
    });
    
    console.log("Purchase email sent via Resend:", data);
    return true;
  } catch (err) {
    console.error("Failed to send purchase email:", err);
    return false;
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email will not be sent.");
    return false;
  }
  
  try {
    const data = await resend.emails.send({
      from: 'AutoListing <support@autolisting.online>',
      to: email,
      subject: 'Your Login OTP - AutoListing',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">Your Login OTP</h2>
          <p>Here is your One-Time Password for AutoListing:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">
            ${otp}
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p><strong>Do not share this code with anyone.</strong> If you did not request this OTP, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The AutoListing Team</p>
        </div>
      `
    });
    
    console.log("OTP email sent via Resend:", data);
    return true;
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return false;
  }
}
