import express from "express";
import { auth } from "../middlewares/auth.js";
import { validation } from "../middlewares/validation.js";
import ticketShema from "./ticketschema.js";
import {
  INSERT_TICKET,
  GET_ALL_TICKETS,
  GET_TICKET_BY_ID,
} from "./ticketController.js";

export const ticketsRouter = express.Router();

ticketsRouter.get("/all", GET_ALL_TICKETS);
ticketsRouter.get("/:id", GET_TICKET_BY_ID);

ticketsRouter.post(
  "/insert_ticket",
  auth,
  validation(ticketShema),
  INSERT_TICKET
);
