import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "aitdevents@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface OrderEmailRequest {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  deliveryAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-confirmation function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: OrderEmailRequest = await req.json();
    const { orderNumber, customerEmail, customerName, items, subtotal, discount, total, deliveryAddress } = body;

    const itemsHtml = items.map((item) => `<tr><td style="padding:12px;border-bottom:1px solid #eee;">${item.title}</td><td style="padding:12px;text-align:center;">${item.quantity}</td><td style="padding:12px;text-align:right;">₹${item.price * item.quantity}</td></tr>`).join("");

    const customerHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:30px;text-align:center;"><h1 style="color:white;">🎉 Order Confirmed!</h1></div><div style="padding:30px;"><p>Hi <strong>${customerName}</strong>,</p><p>Thank you for your order!</p><div style="background:#f9fafb;padding:20px;border-radius:12px;"><h2 style="color:#10b981;">Order #${orderNumber}</h2><table style="width:100%;">${itemsHtml}</table><div style="margin-top:20px;border-top:2px solid #e5e7eb;padding-top:15px;"><p>Subtotal: ₹${subtotal}</p>${discount > 0 ? `<p style="color:#10b981;">Discount: -₹${discount}</p>` : ''}<p style="font-size:20px;font-weight:bold;color:#10b981;">Total: ₹${total}</p></div></div><p><strong>📍 Delivery:</strong> ${deliveryAddress}</p></div></div>`;

    const adminHtml = `<div style="font-family:sans-serif;"><h1>🛍️ New Order #${orderNumber}</h1><p><strong>Customer:</strong> ${customerName} (${customerEmail})</p><p><strong>Total:</strong> ₹${total}</p><p><strong>Address:</strong> ${deliveryAddress}</p><h3>Items:</h3><table>${itemsHtml}</table></div>`;

    // Send customer email
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: "AITD Store <onboarding@resend.dev>", to: [customerEmail], subject: `Order Confirmed! #${orderNumber}`, html: customerHtml }),
    });

    // Send admin email
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: "AITD Store <onboarding@resend.dev>", to: [ADMIN_EMAIL], subject: `New Order #${orderNumber} - ₹${total}`, html: adminHtml }),
    });

    console.log("Emails sent:", await customerRes.json(), await adminRes.json());

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
