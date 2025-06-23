import { v4 as uuidv4 } from "uuid";
import UserModel from "./UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TicketModel from "../ticket/ticketModel.js";

export const REGISTER_USER = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Validation failed - email must contain @",
      });
    }

    // Name capitalization
    const capitalizedName = name
      ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      : "";

    // Password validation
    if (!password || password.length < 6 || !/\d/.test(password)) {
      return res.status(400).json({
        message:
          "Validation failed - password must have at least 6 symbols and 1 number",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      id: uuidv4(),
      name: capitalizedName,
      email,
      password: passwordHash,
      bought_tickets: [],
      money_balance: 0, // Initialize with 0 or set default value
    });

    // Remove this line - don't push to array
    // users.push(newUser);

    const data = await newUser.save(); // Simplified - no need for new UserModel(newUser)

    const accessToken = jwt.sign(
      { id: data.id, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { id: data.id, email: data.email },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      // Changed to 200 as per requirements
      message: "User was created successfully",
      user: data,
      jwt_token: accessToken, // Changed naming as per requirements
      jwt_refresh_token: refreshToken,
    });
  } catch (err) {
    const DUPLICATE_ERROR_CODE = 11000;

    if (err.code === DUPLICATE_ERROR_CODE) {
      return res.status(409).json({
        message: "User with this email already exist",
      });
    } else if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
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
      { expiresIn: "1d" } // Changed to 1d as per requirements
    );

    return res.status(200).json({
      message: "Logged in successfully",
      jwt_token: accessToken, // Changed naming
      jwt_refresh_token: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const NEW_JWT_TOKEN = async (req, res) => {
  try {
    const { jwt_refresh_token } = req.body; // Changed naming

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
      .sort({ name: 1 }) // Alphabetical order by name
      .select("-password -__v");

    return res.status(200).json({
      users: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USER_BY_ID = async (req, res) => {
  try {
    const userId = req.params.id; // Changed from req.body to req.params

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
      message: "Something went wrong",
    });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    const { user_id, ticket_id } = req.body; // Changed naming as per requirements

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

    if (user.money_balance < ticket.ticket_price) {
      return res.status(400).json({
        message: "Not enough money in balance",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { id: user_id },
      {
        $inc: { money_balance: -ticket.ticket_price },
        $push: { bought_tickets: ticket_id },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    return res.status(200).json({
      message: "Ticket was bought successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USERS_WITH_TICKETS = async (req, res) => {
  try {
    const usersWithTickets = await UserModel.aggregate([
      {
        $lookup: {
          from: "tickets", // Make sure this matches your collection name
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

    return res.status(200).json({
      message: "All users with tickets",
      users: usersWithTickets,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USER_BY_ID_WITH_TICKETS = async (req, res) => {
  try {
    const userId = req.params.id; // Changed from req.body to req.params

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
