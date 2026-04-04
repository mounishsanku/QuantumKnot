import nodemailer from "nodemailer";
import logger from "../logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn("Email credentials missing. Skipping email send.");
      return;
    }
    if (!to) {
      logger.warn("No recipient email provided.");
      return;
    }

    const info = await transporter.sendMail({
      from: `"TriggrPay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    logger.info(`Email sent successfully to ${to} [${info.messageId}]`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    // Do NOT throw to prevent breaking the main flow
  }
}

export async function sendPolicyCreatedEmail(user, policy) {
  const subject = "Your TriggrPay Policy is Active!";
  const text = `Hi ${user.name || 'Rider'},\n\nYour policy has been successfully created and is now active.\nCoverage Amount: INR ${policy.coverageAmount}\nWeekly Premium: INR ${policy.weeklyPremium}\nTier: ${policy.tier}\n\nStay safe on the roads!\n\n- The TriggrPay Team`;
  
  await sendEmail(user.email, subject, text);
}

export async function sendPayoutSuccessEmail(user, payout) {
  const subject = "TriggrPay Payout Successful!";
  const text = `Hi ${user.name || 'Rider'},\n\nA payout of INR ${payout.payoutAmount} has been successfully processed for your recent trigger.\nTransaction ID: ${payout.transactionId || 'N/A'}\n\nWe've got your back!\n\n- The TriggrPay Team`;
  
  await sendEmail(user.email, subject, text);
}
