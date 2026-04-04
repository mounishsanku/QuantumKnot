import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  tier: { type: String, enum: ["standard", "ev"], required: true },
  addOns: [{ type: String, enum: ["night", "festival", "device"] }],
  weeklyPremium: { type: Number, required: true },
  coverageAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
  },
  startDate: { type: Date, default: Date.now },
  nextRenewalDate: { type: Date, required: true },
  city: { type: String, required: true },
  vehicleType: { type: String, required: true },
});

const Policy = mongoose.model("Policy", policySchema);
export default Policy;
