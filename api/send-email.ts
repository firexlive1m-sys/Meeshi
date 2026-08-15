import { Resend } from 'resend';

// Vercel serverless function entrypoint
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure the RESEND_API_KEY environment variable is set in Vercel
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { name, email, plan_name, order_id, download_link } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // IMPORTANT: Aapko apna Vercel par verified domain yahan daalna hoga 'from' mein
    // Example: 'support@autolisting.online'
    const fromEmail = 'support@autolisting.online'; 

    // Yahan aapka Resend HTML template aayega. 
    // Isko aap exactly apne Resend dashboard wale design jaisa edit kar sakte hain.
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10B981;">Purchase Successful! 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for purchasing the <strong>${plan_name}</strong>. Your payment (Order ID: ${order_id}) has been successfully verified.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="margin-bottom: 15px; font-size: 16px;">Click the button below to access your tool:</p>
          <a href="${download_link}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Access Dashboard
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link in your browser: <br/> <a href="${download_link}">${download_link}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Team Auto Listing Tool</p>
      </div>
    `;

    const data = await resend.emails.send({
      from: \`Auto Listing Tool <\${fromEmail}>\`,
      to: [email],
      subject: 'Your Purchase is Confirmed! - Auto Listing Tool',
      html: emailHtml,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Resend error:", error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
