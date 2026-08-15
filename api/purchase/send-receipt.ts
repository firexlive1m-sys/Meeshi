import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, plan_name, order_id, download_link } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!resend) {
      console.log("Mock sending receipt to:", email);
      return res.json({ success: true, message: "Receipt logged to console." });
    }

    await resend.emails.send({
      from: 'Meesho Auto Listing • Purchase Confirmation <Support@autolisting.online>',
      to: email,
      subject: '🎉 Purchase Successful – Your Auto Listing Tool is Ready',
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Order is Confirmed!</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f4f5f7;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .header {
    background-color: #2874F0;
    color: #ffffff;
    text-align: center;
    padding: 30px 20px;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
  }
  .content {
    padding: 30px 20px;
  }
  .greeting {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .order-details {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 25px;
  }
  .order-details p {
    margin: 5px 0;
    font-size: 14px;
  }
  .instructions {
    margin-bottom: 25px;
  }
  .instructions h2 {
    font-size: 18px;
    color: #1e293b;
    margin-top: 0;
  }
  .step {
    display: flex;
    margin-bottom: 15px;
  }
  .step-number {
    background-color: #2874F0;
    color: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
  }
  .step-text {
    font-size: 15px;
    margin: 0;
    padding-top: 2px;
  }
  .button-container {
    text-align: center;
    margin: 30px 0;
  }
  .button {
    background-color: #2874F0;
    color: #ffffff;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    box-shadow: 0 4px 6px rgba(40, 116, 240, 0.2);
  }
  .footer {
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    padding: 20px;
    font-size: 13px;
    color: #64748b;
  }
  .highlight {
    font-weight: bold;
    color: #0f172a;
  }
  @media only screen and (max-width: 600px) {
    .container {
      margin: 0;
      border-radius: 0;
    }
  }
</style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Payment successful. Your tool access is ready — log in with your registered email to get started</div>
  <div class="container">
    <div class="header">
      <h1>Purchase Successful! 🎉</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi ${name || 'Customer'},
      </div>
      
      <p>Thank you for your purchase! Your order has been successfully processed and your tool is now ready to use.</p>
      
      <div class="order-details">
        <p><strong>Order ID:</strong> ${order_id}</p>
        <p><strong>Plan:</strong> ${plan_name || 'Lifetime'}</p>
        <p><strong>Registered Email:</strong> ${email}</p>
      </div>

      <div class="instructions">
        <h2>How to Access Your Tool:</h2>
        
        <div class="step">
          <div class="step-number">1</div>
          <p class="step-text">Click the button below to visit the Download Dashboard.</p>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <p class="step-text">Click on <span class="highlight">"Continue with Email"</span> or <span class="highlight">"Google Account"</span> to login.</p>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <p class="step-text"><strong>Very Important:</strong> You MUST login with the exact same email address you used for purchase: <span class="highlight" style="color: #2874F0;">${email}</span></p>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <p class="step-text">Once logged in, your purchased tool will automatically be unlocked on the dashboard!</p>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://autolisting.online/download" class="button">Go to Download Dashboard</a>
      </div>
      
      <p style="font-size: 14px;">If you have any questions or face any issues, you can contact us via WhatsApp support from the dashboard.</p>
    </div>
    
    <div class="footer">
      <p>&copy; Auto Listing Tool. All rights reserved.</p>
      <p>This is an automated email, please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
      `
    });

    res.json({ success: true, message: "Receipt sent successfully" });
  } catch (err: any) {
    console.error("Error sending receipt:", err);
    res.status(500).json({ error: "Failed to send receipt", message: err.message });
  }
}
