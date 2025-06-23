import Joi from "joi";

export const userRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().pattern(/@/),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*\d).{6,}$/),
  money_balance: Joi.number().default(0),
  bought_tickets: Joi.array().items(Joi.string()).default([]),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const tokenSchema = Joi.object({
  jwt_refresh_token: Joi.string().required(),
});

export const buyTicketSchema = Joi.object({
  ticket_id: Joi.string().required(),
});
