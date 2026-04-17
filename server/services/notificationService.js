import axios from "axios";

/**
 * Notification Service — SendGrid Integration
 * 
 * Logic:
 * 1. Send payout notification emails to riders
 * 2. Fallback to console logging if credentials missing
 */
export async function sendPayoutNotification(email, amount) {
  try {
    const API_KEY = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || "no-reply@triggrpay.com";

    if (!API_KEY) {
      console.log(`[NOTIFICATION FALLBACK] Payout of ₹${amount} sent to ${email}`);
      return;
    }

    const data = {
      personalizations: [{ to: [{ email }] }],
      from: { email: fromEmail, name: "TriggrPay" },
      subject: "Your TriggrPay Payout is on its way!",
      content: [
        {
          type: "text/plain",
          value: `Hi Rider, your payout of ₹${amount} for the recent disruption has been processed and is on its way to your UPI ID.`
        }
      ]
    };

    await axios.post("https://api.sendgrid.com/v3/mail/send", data, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    console.log(`[NOTIFICATION] Payout email sent to ${email}`);
  } catch (error) {
    // Fail gracefully — don't crash the server for a failed notification
    console.error(`[NOTIFICATION ERROR] Failed to send email to ${email}: ${error.message}`);
  }
}
