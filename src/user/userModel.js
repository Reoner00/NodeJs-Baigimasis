import mongoose from "mongoose";

const userModel = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  money_balance: { type: Number, default: 100 },
  bought_tickets: { type: [String], default: [] },
});

const UserModel = mongoose.models.User || mongoose.model("User", userModel);

export default UserModel;
