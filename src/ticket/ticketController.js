import { v4 as uuidv4 } from "uuid";
import TicketModel from "./ticketModel.js";
import UserModel from "../user/UserModel.js";

export const INSERT_TICKET = async (req, res) => {
  try {
    const data = {
      ...req.body,
      id: uuidv4(),
    };

    const response = new TicketModel(data);
    const ticket = await response.save();

    res.status(201).json({
      message: "Ticket inserted.",
      ticket: ticket,
    });
  } catch (error) {
    res.status(500).json({ message: "There are issues", error: error });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    const { user_id, ticket_id } = req.body;
    if (!user_id || !ticket_id) {
      return res.status(400).json({
        message: "User id and Ticket id required",
      });
    }

    const user = await UserModel.findOne({ id: user_id });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const ticket = await TicketModel.findOne({ id: ticket_id });
    if (!ticket) {
      return res.status(404).json({
        message: "Ticket with such id not found.",
      });
    }

    if (user.money_balance < ticket.ticket_price) {
      return res.status(400).json({
        message: "User does not have enough money for ticket",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { id: user_id },
      {
        $push: { bought_tickets: ticket_id },
        $inc: { money_balance: -ticket.ticket_price },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Ticket successfully bought",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "There are issues", error: error });
  }
};
