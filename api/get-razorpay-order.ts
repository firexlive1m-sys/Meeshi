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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const url = `https://api.razorpay.com/v1/orders/${orderId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay Order Fetch failed:", data);
      return res.status(response.status).json({
        error: data.error?.description || "Failed to fetch order details.",
        details: data
      });
    }

    // Fetch payments for this order
    const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      }
    });

    const paymentsData = await paymentsResponse.json();
    let customerDetails = { customer_name: "Customer", customer_phone: "", customer_email: "" };
    
    if (paymentsResponse.ok && paymentsData.items && paymentsData.items.length > 0) {
      const payment = paymentsData.items[0];
      customerDetails = {
        customer_name: payment.notes?.name || "Customer",
        customer_email: payment.email || payment.notes?.email || "",
        customer_phone: payment.contact || payment.notes?.phone || ""
      };
    } else {
      customerDetails = {
        customer_name: data.notes?.name || "Customer",
        customer_email: data.notes?.email || "",
        customer_phone: data.notes?.phone || ""
      };
    }

    return res.json({
      order_id: data.id,
      order_amount: data.amount / 100, // Convert paise back to INR
      order_status: data.status,
      customer_details: customerDetails
    });

  } catch (err: any) {
    console.error("Error retrieving Razorpay order details:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
