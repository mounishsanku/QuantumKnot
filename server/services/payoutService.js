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
    
    // Create record in DB
    const payoutDoc = await Payout.create({
      claimId,
      riderId,
      amount: rounded,
      upiId: upiId || "",
      status: "processing",
    });

    // --- PHASE 2: SIMULATED PAYOUT ---
    const timestamp = Date.now();
    const transactionId = `txn_${timestamp}`;
    const razorpayPayoutId = `payout_sim_${timestamp}`;

    console.log("[PAYOUT] Simulated payout created");

    // AFTER 1.5 seconds: simulate success update (non-blocking)
    setTimeout(async () => {
      try {
        payoutDoc.razorpayPayoutId = razorpayPayoutId;
        payoutDoc.transactionId = transactionId;
        payoutDoc.status = "completed";
        await payoutDoc.save();
        console.log("[PAYOUT] Status updated to success");
      } catch (e) {
        console.error("[PAYOUT SIM ERROR]", e.message);
      }
    }, 1500);

    return {
      status: "processing",
      transactionId,
      razorpayPayoutId,
      payout: payoutDoc,
    };
  } catch (err) {
    logger.error(`[payout] Failed to process payout: ${err.message}`);
    throw new Error(`Payout processing failed: ${err.message}`);
  }
}
