import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./userModel.js";
import TicketModel from "../ticket/ticketModel.js";

export const REGISTER_USER = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      id: uuidv4(),
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      email,
      password: hashedPassword,
      money_balance: 100,
      bought_tickets: [],
    });

    await user.save();

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_JWT_SECRET
    );

    res.status(201).json({
      message: "User registered successfully",
      jwt_token: jwtToken,
      jwt_refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        money_balance: user.money_balance,
        bought_tickets: user.bought_tickets,
      },
    });
  } catch (err) {
    console.log("REGISTER_USER Error:", err);
    res.status(400).json({
      message:
        "Email address is already registered. Please use a different email.",
    });
  }
};

export const LOGIN_USER = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Wrong email or password",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(404).json({
        message: "Wrong email or password",
      });
    }

    const accessToken = jwt.sign(
      { userEmail: user.email, userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Logged in successfully",
      jwt_token: accessToken,
      jwt_refresh_token: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Login failed due to server error. Please try again later.",
    });
  }
};

export const NEW_JWT_TOKEN = async (req, res) => {
  try {
    const { jwt_refresh_token } = req.body;

    if (!jwt_refresh_token) {
      return res.status(400).json({
        message: "User must log in again",
      });
    }

    const decoded = jwt.verify(
      jwt_refresh_token,
      process.env.REFRESH_JWT_SECRET
    );
    const userId = decoded.userId;

    const user = await UserModel.findOne({ id: userId });

    if (!user) {
      return res.status(400).json({
        message: "User must log in again",
      });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "New JWT token created",
      jwt_token: newAccessToken,
      jwt_refresh_token: jwt_refresh_token,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "User must log in again",
    });
  }
};

export const ALL_USERS = async (req, res) => {
  try {
    const users = await UserModel.find({})
      .sort({ name: 1 })
      .select("-password -__v");

    return res.status(200).json({
      users: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to retrieve users. Please try again later.",
    });
  }
};

export const USER_BY_ID = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findOne({ id: userId }).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to retrieve user information. Please try again later.",
    });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    const { ticket_id } = req.body;
    const user_id = req.user.userId;
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
        message: "Ticket not found",
      });
    }
    if (user.bought_tickets.includes(ticket_id)) {
      return res.status(400).json({
        message: "You have already purchased this ticket",
      });
    }

    if (user.money_balance < ticket.ticket_price) {
      return res.status(400).json({
        message: "Not enough money in balance",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { id: user_id },
      {
        $push: { bought_tickets: ticket_id },
        $inc: { money_balance: -ticket.ticket_price },
      },
      { new: true, select: "-password" }
    );

    res.status(200).json({
      message: "Ticket purchased successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        money_balance: updatedUser.money_balance,
        bought_tickets: updatedUser.bought_tickets,
      },
      purchased_ticket: {
        id: ticket.id,
        title: ticket.title,
        price: ticket.ticket_price,
        from: ticket.from_location,
        to: ticket.to_location,
      },
    });
  } catch (err) {
    console.log("BUY_TICKET Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const USERS_WITH_TICKETS = async (req, res) => {
  try {
    const users = await UserModel.aggregate([
      {
        $match: {
          $expr: { $gt: [{ $size: "$bought_tickets" }, 0] },
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "bought_tickets",
          foreignField: "id",
          as: "bought_tickets_details",
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json({
      message:
        users.length > 0
          ? "Users with tickets retrieved successfully"
          : "No users have purchased tickets yet",
      total_users_with_tickets: users.length,
      users: users,
    });
  } catch (err) {
    console.log("USERS_WITH_TICKETS Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const USER_BY_ID_WITH_TICKETS = async (req, res) => {
  try {
    const userId = req.params.id;

    const userWithTickets = await UserModel.aggregate([
      {
        $match: { id: userId },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "bought_tickets",
          foreignField: "id",
          as: "userTickets",
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          "userTickets.__v": 0,
        },
      },
    ]);

    if (!userWithTickets.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User by id with tickets",
      user: userWithTickets[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const GET_MY_TICKETS = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const user = await UserModel.aggregate([
      { $match: { id: user_id } },
      {
        $lookup: {
          from: "tickets",
          localField: "bought_tickets",
          foreignField: "id",
          as: "my_tickets_details",
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Your tickets retrieved successfully",
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        money_balance: user[0].money_balance,
        total_tickets: user[0].bought_tickets.length,
        my_tickets: user[0].my_tickets_details,
      },
    });
  } catch (err) {
    console.log("GET_MY_TICKETS Error:", err);
    res.status(500).json({
      message: "Failed to retrieve your tickets. Please try again later.",
    });
  }
};
