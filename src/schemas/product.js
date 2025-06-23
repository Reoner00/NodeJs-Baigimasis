import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  imageUrl: Joi.string().uri().required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().min(2).max(50).required(),
});
export default productSchema;
