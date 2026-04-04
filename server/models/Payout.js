import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, default: "" },
  razorpayPayoutId: { type: String, default: "" },
  transactionId: { type: String, default: "" },
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  createdAt: { type: Date, default: Date.now },
});

const Payout = mongoose.model("Payout", payoutSchema);
export default Payout;
