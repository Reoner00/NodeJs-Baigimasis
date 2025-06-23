import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { usersRouter } from "./src/user/userRoutes.js";
import { ticketsRouter } from "./src/ticket/ticketRoutes.js";

const app = express();

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(console.log("Connected to DB"))
  .catch((err) => {
    console.log(`Failed to connect, error ${err}`);
  });

app.use(express.json());
app.use(cors());

app.use("/users", usersRouter);
app.use("/tickets", ticketsRouter);

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`);
});
