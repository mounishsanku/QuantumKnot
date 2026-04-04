import twilio from "twilio";
import logger from "../logger.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendSMS(to, message) {
  try {
    if (!client || !fromPhone) {
      logger.warn("Twilio credentials missing. Skipping SMS send.");
      return;
    }
    if (!to) {
      logger.warn("No recipient phone number provided.");
      return;
    }

    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to,
    });

    logger.info(`SMS sent successfully to ${to} [SID: ${response.sid}]`);
  } catch (error) {
    logger.error(`Failed to send SMS to ${to}: ${error.message}`);
    // Do NOT throw to prevent breaking the main flow
  }
}

export async function sendPayoutSMS(user, payout) {
  // Assuming user provides a phone number. We append country code if missing, but we'll trust the DB format for now.
  const phone = user.phone || user.phoneNumber;
  const message = `TriggrPay: Payout of INR ${payout.payoutAmount} for ${payout.triggerType} processed. Txn: ${payout.transactionId || 'N/A'}`;
  
  await sendSMS(phone, message);
}
