import Joi from "joi";

export const userRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().pattern(/@/),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*\d).{6,}$/),
  money_balance: Joi.number(),
  bought_tickets: Joi.array().items(Joi.string()),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const tokenSchema = Joi.object({
  token: Joi.string().required(),
});
