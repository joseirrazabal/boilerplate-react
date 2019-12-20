import Joi from 'joi';

export default  {
  query: {
    challenge : Joi.string().required(),
    deviceid  : Joi.string().required(),
    manifest  : Joi.string().required(),
    laurl     : Joi.string().when('provider', {is: Joi.exist(), then: Joi.string().optional(), otherwise: Joi.string().required() }),
    provider  : Joi.string().optional(),
  }
};
