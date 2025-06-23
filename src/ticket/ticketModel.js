import mongoose from "mongoose";

const ticketSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  ticket_price: { type: Number, required: true },
  from_location: { type: String, required: true },
  to_location: { type: String, required: true },
  to_location_photo_url: { type: String, required: true },
});

const TicketModel =
  mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default TicketModel;
