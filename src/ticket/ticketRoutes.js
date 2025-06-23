import express from "express";
import { auth } from "../middlewares/auth.js";
import { validation } from "../middlewares/validation.js";
import ticketShema from "./ticketschema.js";
import { BUY_TICKET, INSERT_TICKET } from "./ticketController.js";

export const ticketsRouter = express.Router();

ticketsRouter.post(
  "/insert_ticket",
  auth,
  validation(ticketShema),
  INSERT_TICKET
);
ticketsRouter.post("/buyTicket", auth, BUY_TICKET);
