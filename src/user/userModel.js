import mongoose from "mongoose";

const userModel = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  money_balance: { type: Number, required: true },
  bought_tickets: { type: [String], required: true },
});

export default mongoose.model("User", userModel);
