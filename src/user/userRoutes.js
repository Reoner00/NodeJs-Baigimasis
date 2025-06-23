import express from "express";
import {
  ALL_USERS,
  USER_BY_ID,
  LOGIN_USER,
  REGISTER_USER,
  NEW_JWT_TOKEN,
  USERS_WITH_TICKETS,
  USER_BY_ID_WITH_TICKETS,
  BUY_TICKET,
  GET_MY_TICKETS,
} from "./userController.js";
import { validation } from "../middlewares/validation.js";
import {
  tokenSchema,
  userLoginSchema,
  userRegisterSchema,
  buyTicketSchema,
} from "./userSchema.js";
import { auth } from "../middlewares/auth.js";

export const usersRouter = express.Router();

//all users
usersRouter.post("/signUp", validation(userRegisterSchema), REGISTER_USER);
usersRouter.post("/login", validation(userLoginSchema), LOGIN_USER);
usersRouter.post("/getNewJwtToken", validation(tokenSchema), NEW_JWT_TOKEN);

//only login users
usersRouter.get("/my-tickets", auth, GET_MY_TICKETS);
usersRouter.post("/buyTicket", auth, validation(buyTicketSchema), BUY_TICKET);

//only admin command
usersRouter.get("/getAllUsers", auth, ALL_USERS);
usersRouter.get("/getUserById/:id", auth, USER_BY_ID);
usersRouter.get("/getAllUsersWithTickets", auth, USERS_WITH_TICKETS);
usersRouter.get("/getUserByIdWithTickets/:id", auth, USER_BY_ID_WITH_TICKETS);
