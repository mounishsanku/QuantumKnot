import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
  triggerType: {
    type: String,
    required: true,
    enum: [
      "rainfall",
      "flood",
      "aqi",
      "curfew",
      "heat",
      "gridOutage",
      "chargingCongestion",
      "nightDisruption",
      "orderDrought",
      "zoneClosure",
      "strike",
    ],
  },
  triggerValue: { type: String, required: true },
  zone: { type: String, required: true },
  incomeEstimate: { type: Number, default: 0 },
  payoutAmount: { type: Number, default: 0 },
  fraudScore: { type: Number, min: 0, max: 100, default: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "paid"],
    default: "pending",
  },
  autoTriggered: { type: Boolean, default: true },
  explanation: { type: String, default: "" },
  breakdown: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
