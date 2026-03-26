import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const isPlaceholder = host === "smtp.example.com" || user === "user@example.com" || pass === "password";
    
    if (!host || !user || !pass || isPlaceholder) {
      if (isPlaceholder) {
        console.warn("SMTP is still using default placeholder values. Email notifications are disabled.");
      } else {
        console.warn("SMTP configuration is incomplete. Email notifications will be disabled.");
      }
      return null;
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
  const client = getTransporter();
  if (!client) return;

  try {
    const info = await client.sendMail({
      from: process.env.SMTP_FROM || `"PromptPay USDT" <noreply@${process.env.SMTP_HOST?.split('.').slice(-2).join('.') || 'example.com'}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export const emailTemplates = {
  orderCreated: (order: any) => ({
    subject: `[${process.env.APP_NAME || "PromptPay USDT"}] Order Created: ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Order Created Successfully</h2>
        <p>Hi ${order.customerName},</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been created. Please proceed with the payment.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${order.amountTHB.toLocaleString()} THB</p>
          <p style="margin: 5px 0;"><strong>Estimated USDT:</strong> ${order.estimatedUSDT.toFixed(2)} USDT</p>
          <p style="margin: 5px 0;"><strong>Network:</strong> ${order.network}</p>
          <p style="margin: 5px 0;"><strong>Wallet:</strong> ${order.walletAddress}</p>
        </div>
        <p>Please upload your payment slip in the dashboard to complete the order.</p>
        <a href="${process.env.APP_URL}/orders/${order.id}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Order Details</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  }),
  paymentApproved: (order: any) => ({
    subject: `[${process.env.APP_NAME || "PromptPay USDT"}] Payment Approved: ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Payment Approved</h2>
        <p>Hi ${order.customerName},</p>
        <p>Your payment for order <strong>${order.orderNumber}</strong> has been approved. We are now processing your USDT transfer.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${order.amountTHB.toLocaleString()} THB</p>
          <p style="margin: 5px 0;"><strong>Network:</strong> ${order.network}</p>
          <p style="margin: 5px 0;"><strong>Wallet:</strong> ${order.walletAddress}</p>
        </div>
        <p>You will receive another email once the USDT has been sent.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  }),
  usdtSent: (order: any) => ({
    subject: `[${process.env.APP_NAME || "PromptPay USDT"}] USDT Sent: ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">USDT Sent Successfully!</h2>
        <p>Hi ${order.customerName},</p>
        <p>The USDT for your order <strong>${order.orderNumber}</strong> has been sent to your wallet.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>USDT Amount:</strong> ${order.finalUSDT || order.estimatedUSDT} USDT</p>
          <p style="margin: 5px 0;"><strong>Network:</strong> ${order.network}</p>
          <p style="margin: 5px 0;"><strong>Transaction Hash:</strong> <code style="word-break: break-all;">${order.txHash}</code></p>
        </div>
        <p>Thank you for using our service!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  }),
};
