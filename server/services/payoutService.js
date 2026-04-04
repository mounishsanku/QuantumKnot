import axios from "axios";
import crypto from "crypto";
import Payout from "../models/Payout.js";
import logger from "../logger.js";

async function verifyRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return false;
  try {
    await axios.get("https://api.razorpay.com/v1/payments?count=1", {
      auth: { username: keyId, password: keySecret },
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

export async function processPayout(claimId, riderId, amount, upiId) {
  try {
    const rounded = Math.round(amount * 100) / 100;
    const payoutDoc = await Payout.create({
      claimId,
      riderId,
      amount: rounded,
      upiId: upiId || "",
      status: "processing",
    });

    const keysOk = await verifyRazorpayKeys();
    if (keysOk) {
      logger.info("Razorpay API keys validated; recording demo payout (RazorpayX fund account required for live UPI transfers).");
    }

    const transactionId = `txn_${crypto.randomBytes(14).toString("hex")}`;
    const razorpayPayoutId = `rzp_test_${payoutDoc._id.toString()}`;

    payoutDoc.razorpayPayoutId = razorpayPayoutId;
    payoutDoc.transactionId = transactionId;
    payoutDoc.status = "completed";
    await payoutDoc.save();

    return {
      transactionId,
      razorpayPayoutId,
      payout: payoutDoc,
    };
  } catch (err) {
    logger.error(`[payout] Failed to process payout: ${err.message}`);
    throw new Error(`Payout processing failed: ${err.message}`);
  }
}
