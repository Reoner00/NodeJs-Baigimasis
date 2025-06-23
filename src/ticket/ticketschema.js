import Joi from "joi";

const ticketShema = Joi.object({
  title: Joi.string().required(),
  ticket_price: Joi.number().required(),
  from_location: Joi.string().required(),
  to_location: Joi.string().required(),
  to_location_photo_url: Joi.string().required(),
});

export default ticketShema;
