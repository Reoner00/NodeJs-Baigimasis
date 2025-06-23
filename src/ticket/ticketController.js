import { v4 as uuidv4 } from "uuid";
import TicketModel from "./ticketModel.js";

export const INSERT_TICKET = async (req, res) => {
  try {
    const data = {
      ...req.body,
      id: uuidv4(),
    };

    const ticket = new TicketModel(data);
    await ticket.save();

    res.status(201).json({
      message: "Ticket inserted successfully",
      ticket: ticket,
      created_by: req.user.userId,
    });
  } catch (error) {
    console.log("INSERT_TICKET Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const GET_ALL_TICKETS = async (req, res) => {
  try {
    const tickets = await TicketModel.find({}).sort({ title: 1 });

    res.status(200).json({
      message: "All tickets retrieved successfully",
      total_tickets: tickets.length,
      tickets: tickets,
    });
  } catch (error) {
    console.log("GET_ALL_TICKETS Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ✅ Функция для получения билета по ID
export const GET_TICKET_BY_ID = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await TicketModel.findOne({ id: ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket: ticket,
    });
  } catch (error) {
    console.log("GET_TICKET_BY_ID Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
