const Joi = require("joi");

// all keys which are sent from the FE must be ncluded here, otherwise an error is thrown
const campgroundSchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required().min(0),
  location: Joi.string().required(),
  image: Joi.string().allow(""),
  description: Joi.string().allow(""),
});

module.exports = { campgroundSchema };
