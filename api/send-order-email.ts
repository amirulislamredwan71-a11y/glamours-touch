import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 200_000) reject(new Error('too_large')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const json = (res: VercelResponse, code: number, obj: any) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(code).send(JSON.stringify(obj));
};

interface CartItemPayload {
  title: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
}

interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  upazila: string;
  district: string;
  cart: CartItemPayload[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: string;
  notes?: string;
}

function buildEmailHtml(payload: OrderEmailPayload, displayId: string): string {
  const itemsHtml = payload.cart
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #232d34;">
        <td style="padding: 12px; vertical-align: middle;">
          <div style="font-weight: bold; color: #ffffff; font-size: 14px;">${item.title}</div>
          ${item.variant ? `<div style="color: #e5b83a; font-size: 11px; margin-top: 2px;">Shade/Size: ${item.variant}</div>` : ''}
        </td>
        <td style="padding: 12px; text-align: center; color: #d1d5db; font-size: 14px;">x${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #e5b83a; font-size: 14px;">৳${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order #${displayId} — Glamour's Touch</title>
      </head>
      <body style="background-color: #0b0f12; color: #e5e7eb; font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #12181d; border: 2px solid #e5b83a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

          <div style="background: linear-gradient(135deg, #182026 0%, #0b0f12 100%); padding: 24px; text-align: center; border-bottom: 1px solid rgba(229, 184, 58, 0.3);">
            <h1 style="color: #e5b83a; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
              GLAMOUR'S TOUCH
            </h1>
            <p style="color: #ffffff; font-size: 12px; margin: 6px 0 0 0; letter-spacing: 1px;">
              বাংলাদেশের ১০০% অরিজিনাল কোরিয়ান কসমেটিকস শপ 🇰🇷
            </p>
          </div>

          <div style="padding: 20px 24px; background: #161e24; border-bottom: 1px solid #232d34; text-align: center;">
            <div style="display: inline-block; background: rgba(229, 184, 58, 0.15); border: 1px solid #e5b83a; padding: 6px 16px; border-radius: 20px; color: #e5b83a; font-weight: bold; font-size: 13px;">
              🎉 নতুন অর্ডার প্রাপ্তি — #${displayId}
            </div>
          </div>

          <div style="padding: 20px 24px; border-bottom: 1px solid #232d34;">
            <h3 style="color: #e5b83a; font-size: 14px; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 1px;">
              👤 কাস্টমার ডেলিভারি তথ্য:
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #d1d5db;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #9ca3af; width: 110px;">কাস্টমার নাম:</td>
                <td style="padding: 4px 0; color: #ffffff; font-weight: bold;">${payload.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #9ca3af;">মোবাইল নাম্বার:</td>
                <td style="padding: 4px 0; color: #e5b83a; font-weight: bold; font-size: 14px;">${payload.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #9ca3af;">ডেলিভারি ঠিকানা:</td>
                <td style="padding: 4px 0; color: #ffffff;">${payload.customerAddress}, ${payload.upazila}, ${payload.district}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #9ca3af;">পেমেন্ট মেথড:</td>
                <td style="padding: 4px 0; color: #10b981; font-weight: bold;">${payload.paymentMethod}</td>
              </tr>
              ${payload.notes ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #9ca3af;">বিশেষ নোট:</td>
                <td style="padding: 4px 0; color: #f59e0b; font-style: italic;">${payload.notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="padding: 20px 24px;">
            <h3 style="color: #e5b83a; font-size: 14px; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 1px;">
              🛒 অর্ডারকৃত প্রোডাক্ট বিবরণ:
            </h3>
            <table style="width: 100%; border-collapse: collapse; background: #0e1317; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #182128; color: #9ca3af; font-size: 12px; text-transform: uppercase; text-align: left;">
                  <th style="padding: 10px 12px;">প্রোডাক্ট</th>
                  <th style="padding: 10px 12px; text-align: center;">পরিমাণ</th>
                  <th style="padding: 10px 12px; text-align: right;">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="padding: 16px 24px; background: #161e24; border-top: 1px solid #232d34;">
            <table style="width: 100%; font-size: 13px; color: #d1d5db;">
              <tr>
                <td style="padding: 4px 0; color: #9ca3af;">প্রোডাক্ট সাবটোটাল:</td>
                <td style="padding: 4px 0; text-align: right; color: #ffffff;">৳${payload.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #9ca3af;">ডেলিভারি চার্জ:</td>
                <td style="padding: 4px 0; text-align: right; color: #ffffff;">৳${payload.deliveryFee.toLocaleString()}</td>
              </tr>
              <tr style="border-top: 1px solid #232d34;">
                <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #e5b83a;">সর্বমোট মূল্য (Total):</td>
                <td style="padding: 10px 0 0 0; text-align: right; font-size: 18px; font-weight: 900; color: #e5b83a;">৳${payload.grandTotal.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="padding: 16px; text-align: center; background: #0b0f12; color: #6b7280; font-size: 11px; border-top: 1px solid #232d34;">
            GLAMOUR'S TOUCH — 100% Authentic Korean Cosmetics in Bangladesh 🇰🇷<br/>
            Need support? Email us at <a href="mailto:support@glamourstouch.com" style="color: #e5b83a; text-decoration: none;">support@glamourstouch.com</a>
          </div>

        </div>
      </body>
    </html>
  `;
}

// Server-side order-confirmation email relay. Used by BOTH the website checkout
// (src/lib/resend.ts) and the WhatsApp/Messenger bot (n8n, after it creates an
// order directly in Supabase) — a single place that actually holds the Resend
// API key, since neither caller should ever have it client-side.
export default async function handler(req: IncomingMessage & { method?: string; headers: Record<string, any> }, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json(res, 200, { success: false, error: 'Resend API key missing' });

  let payload: OrderEmailPayload;
  try { payload = await readBody(req); } catch { return json(res, 400, { error: 'bad body' }); }

  if (!payload.orderId || !payload.customerName || !payload.customerPhone || !Array.isArray(payload.cart)) {
    return json(res, 400, { error: 'missing required order fields' });
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'glamourstouch26@gmail.com';
  const configuredSender = process.env.SENDER_EMAIL || "Glamour's Touch <orders@glamourstouch.com>";
  const fallbackSender = 'Glamours Touch <onboarding@resend.dev>';
  const displayId = payload.orderId.slice(-8).toUpperCase();
  const emailHtml = buildEmailHtml(payload, displayId);

  const recipients = [adminEmail];
  if (payload.customerEmail && payload.customerEmail.trim().length > 3) {
    recipients.push(payload.customerEmail.trim());
  }

  const sendRequest = (fromAddress: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject: `📦 নতুন অর্ডার #${displayId} — ৳${payload.grandTotal.toLocaleString()} (${payload.customerName})`,
        html: emailHtml,
      }),
    });

  try {
    let response = await sendRequest(configuredSender);
    let resData = await response.json();

    if (!response.ok && resData?.message?.includes('domain')) {
      response = await sendRequest(fallbackSender);
      resData = await response.json();
    }

    if (response.ok) return json(res, 200, { success: true, id: resData.id });
    return json(res, 200, { success: false, error: resData.message || 'Resend API error' });
  } catch (error: any) {
    return json(res, 200, { success: false, error: String(error?.message || error).slice(0, 200) });
  }
}
