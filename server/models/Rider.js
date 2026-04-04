import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, default: "", trim: true },
  password: { type: String, required: true },
  city: {
    type: String,
    required: true,
    enum: ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Pune"],
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["petrol", "ev", "four-wheeler"],
  },
  workingHours: {
    type: String,
    required: true,
    enum: ["morning", "afternoon", "night", "flexible"],
  },
  dailyEarnings: { type: Number, default: 700 },
  workingHoursPerDay: { type: Number, default: 8, min: 1, max: 16 },
  aadharLast4: { type: String, default: "" },
  upiId: { type: String, default: "" },
  kycStatus: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending",
  },
  platforms: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

riderSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Rider = mongoose.model("Rider", riderSchema);
export default Rider;
